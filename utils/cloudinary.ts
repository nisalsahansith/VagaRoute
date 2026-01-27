export const uploadToCloudinary = async (uri: string) => {
  const formData = new FormData()

  formData.append("file", {
    uri,
    name: `profile_${Date.now()}.jpg`,
    type: "image/jpeg"
  } as any)

  formData.append("upload_preset", "VagaRoute")
  formData.append("cloud_name", "dfkgocdgf")

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/dfkgocdgf/image/upload`,
    {
      method: "POST",
      body: formData
    }
  )

  const result = await response.json()

  if (!result.secure_url) {
    throw new Error("Cloudinary upload failed")
  }

  return result.secure_url
}
