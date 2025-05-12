import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // 使用 onAuthStateChanged 监听用户登录状态变化 自动获取当前页面用户信息uid和email
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      // 如果用户已登录，获取用户在数据库的更多信息
      if (currentUser) {

        const token = await currentUser.getIdToken();
        setToken(token);
        // 读取该用户的数据库数据role 参数为db users currentUser.uid
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      } else {
        setRole(null);
        setToken(null);
      }
      // 设置加载状态为 false
      setLoading(false);
    });

     // 清除监听器，防止组件卸载时还在监听
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role,token, loading, setUser, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);