export async function authFetch(url, options = {}) {
  // first attempt
  let res = await fetch(url, {
    ...options,
    credentials: "include", // IMPORTANT
  });

  // if token expired
  if (res.status === 401) {
    // try refresh
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    // refresh failed → logout
    if (!refreshRes.ok) {
      window.location.href = "/login";
      return;
    }

    // retry original request
    res = await fetch(url, {
      ...options,
      credentials: "include",
    });
  }

  return res;
}
