export async function generateFromImage(imageFile, format, token) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("format", format);

  const response = await fetch(`${apiUrl}/project/generate-from-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || `Generation failed with status ${response.status}`);
  }

  return body;
}
