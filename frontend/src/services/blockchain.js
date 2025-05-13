// File: frontend/src/services/blockchain.js

import {
  JsonRpcProvider,
  Wallet,
  Contract,
  keccak256,
  toUtf8Bytes
} from "ethers"

const RPC_URL             = import.meta.env.VITE_RPC_URL
const PRIVATE_KEY         = import.meta.env.VITE_PRIVATE_KEY
const HASH_ADDRESS        = import.meta.env.VITE_HASHSTORAGE_ADDRESS
const SKILLWALLET_ADDRESS = import.meta.env.VITE_SKILLWALLET_ADDRESS

const provider = new JsonRpcProvider(RPC_URL)
const wallet   = new Wallet(PRIVATE_KEY, provider)

let hashContract
let skillContract

async function initContracts() {
  if (hashContract && skillContract) return { hashContract, skillContract }

  const [hashJson, skillJson] = await Promise.all([
    fetch("/HashStorageABI.json").then(r => {
      if (!r.ok) throw new Error(`HashStorage ABI fetch failed: ${r.status}`)
      return r.json()
    }),
    fetch("/SkillWalletABI.json").then(r => {
      if (!r.ok) throw new Error(`SkillWallet ABI fetch failed: ${r.status}`)
      return r.json()
    })
  ])

  const hashAbi  = hashJson.abi  || hashJson
  const skillAbi = skillJson.abi || skillJson

  hashContract  = new Contract(HASH_ADDRESS, hashAbi, wallet)
  skillContract = new Contract(SKILLWALLET_ADDRESS, skillAbi, wallet)

  return { hashContract, skillContract }
}

export async function storeHashAuto(plainText) {
  const { hashContract } = await initContracts()
  const hashValue = keccak256(toUtf8Bytes(plainText))
  const tx = await hashContract.storeHash(hashValue)
  const receipt = await tx.wait()
  return receipt.transactionHash
}

export async function recordUserOnChain({
  customUid,
  email,
  name,
  role,
  schoolId,
  walletAddress
}) {
  const { skillContract } = await initContracts()
  // let gas = await skillContract.estimateGas.registerUser(customUid,email,name,role,schoolId,walletAddress)
  // gas = gas.mul(120).div(100)
  const tx = await skillContract.registerUser(
    customUid,
    email,
    name,
    role,
    schoolId,
    walletAddress
    // ,{ gasLimit: gas }
  )
  const receipt = await tx.wait()
  return receipt.transactionHash
}

export async function recordSkillOnChain({
  courseId,
  ownerId,
  description,
  level,
  schoolId,
  title,
  status
}) {
  const { skillContract } = await initContracts()
  const tx = await skillContract.recordSkill(
    courseId,
    ownerId,
    description,
    level,
    schoolId,
    title,
    status
  )
  const receipt = await tx.wait()
  return receipt.transactionHash
}

export async function addCourseOnChain({
  courseId,
  courseCode,
  courseTitle,
  schoolId
}) {
  const { skillContract } = await initContracts()
  const tx = await skillContract.addCourse(
    courseId,
    courseCode,
    courseTitle,
    schoolId
  )
  const receipt = await tx.wait()
  return receipt.transactionHash
}
