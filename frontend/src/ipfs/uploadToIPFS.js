export async function uploadToIPFS(file) {
  if (!file) throw new Error("No file selected");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("Pinata upload failed: " + errorText);
  }

  const data = await res.json();
  console.log(" Uploaded to Pinata:", data);
  return data.IpfsHash;
}
