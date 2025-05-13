// File: frontend/src/pages/Register.jsx

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../firebase"
import { ethers } from "ethers"
import axios from "axios"
import RegisterForm from "../components/auth/RegisterForm"
import { useAuth } from "../context/AuthContext"
import { recordUserOnChain } from "../services/blockchain"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function Register() {
  const [schoolOptions, setSchoolOptions] = useState([])
  const [loading, setLoading]         = useState(true)
  const navigate                      = useNavigate()
  const { setUser, setRole: setGlobalRole } = useAuth()

  useEffect(() => {
    axios.get(`${BASE_URL}/employer/schools`)
      .then(res => setSchoolOptions(res.data))
      .catch(() => alert("Failed to load school list."))
      .finally(() => setLoading(false))
  }, [])

  const handleRegister = async (username, email, password, role, schoolId) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user           = userCredential.user

    const wallet = ethers.Wallet.createRandom()
    const prefix = role === "student" ? "S" : role === "school" ? "T" : "E"
    const customUid = `${prefix}-${user.uid}`

    const userData = {
      name: username,
      email: user.email,
      role,
      walletAddress: wallet.address,
      customUid,
      createdAt: serverTimestamp()
    }
    if (role === "student" || role === "school") {
      userData.schoolId = schoolId
    }

    await setDoc(doc(db, "users", user.uid), userData)

    await recordUserOnChain({
      customUid,
      email:        user.email,
      name:         username,
      role,
      schoolId:     userData.schoolId || "",
      walletAddress: wallet.address
    })

    setUser(user)
    setGlobalRole(role)

    if (role === "student") navigate("/student")
    else if (role === "school") navigate("/school")
    else navigate("/employer")

    alert(
      `✅ Registration successful.\n\nWallet Address: ${wallet.address}\n\nMnemonic (keep this safe!):\n${wallet.mnemonic.phrase}`
    )
  }

  if (loading) return <p>Loading school list...</p>

  return (
    <RegisterForm onRegister={handleRegister} schoolOptions={schoolOptions} />
  )
}
