import * as w3up from '@web3-storage/w3up-client'

// Sign-In Key you just generated
const SIGNIN_KEY = 'MgCY3hKOI+T6oc/WbxALEuLdcbzyxxLtPPWm2piUDUpe/Ye0BRumnY5l4eVBClwexcIEDPga8ovljSB7sd6LPV4AInF4='

// Your Space DID
const SPACE_DID = 'did:key:z6MktNczCyC6Jkmf5hvEQ6HABNexntdCST5cfGzuuNNhfP2r'

let client

async function getClient() {
  if (client) return client

  client = await w3up.create()
  await client.login(SIGNIN_KEY)
  await client.setCurrentSpace(SPACE_DID)

  return client
}

/**
 * Upload a file to IPFS using w3up
 * @param {File|Blob|Buffer} file
 * @returns {Promise<string>} CID
 */
export async function uploadToIPFS(file) {
  if (!file) {
    throw new Error("No file provided for upload.")
  }

  const c = await getClient()
  const res = await c.uploadFile(file)
  const cid = res.cid.toString()

  console.log(' Uploaded file to IPFS via w3up, CID:', cid)
  return cid
}
