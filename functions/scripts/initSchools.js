import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// 如果admin还没有初始化，就初始化它
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

const schools = [
  {
    code: "QUT",
    name: "Queensland University of Technology"
  },
  {
    code: "UQ", 
    name: "University of Queensland"
  },
  {
    code: "GU",
    name: "Griffith University"
  },
  {
    code: "USQ",
    name: "University of Southern Queensland"
  },
  {
    code: "JCU",
    name: "James Cook University"
  },
  {
    code: "CQU",
    name: "Central Queensland University"
  }
];

async function initializeSchools() {
  try {
    console.log("🏫 Initializing school data...");
    
    for (const school of schools) {
      const docRef = db.collection("schools").doc();
      await docRef.set(school);
      console.log(`✅ Added school: ${school.name} (${school.code})`);
    }
    
    console.log("🎉 All schools initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing schools:", error);
    process.exit(1);
  }
}

initializeSchools(); 