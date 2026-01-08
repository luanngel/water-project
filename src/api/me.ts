export async function uploadMyAvatar(file: File): Promise<{ avatarUrl: string }> {
    const form = new FormData();
    form.append("avatar", file);
  
    const res = await fetch("/api/me/avatar", {
      method: "POST",
      body: form,
      // NO pongas Content-Type; el browser lo agrega con boundary
      headers: {
        // Si usas token:
        // Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    });
  
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload avatar failed: ${res.status} ${text}`);
    }
  
    const data = await res.json();
    if (!data?.avatarUrl) throw new Error("Respuesta sin avatarUrl");
    return { avatarUrl: data.avatarUrl };
  }
  
  export async function updateMyProfile(input: {
    name: string;
    email: string;
  }): Promise<{ name?: string; email?: string; avatarUrl?: string | null }> {
    const res = await fetch("/api/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
      body: JSON.stringify(input),
    });
  
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Update profile failed: ${res.status} ${text}`);
    }
  
    return res.json();
  }
  