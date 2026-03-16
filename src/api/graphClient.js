export async function graphFetch(url, token) {
  const fullUrl = url.startsWith("http")
    ? url
    : `https://graph.microsoft.com/v1.0${url}`;

  const res = await fetch(fullUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const err = new Error("Token expired or invalid");
    err.status = 401;
    throw err;
  }

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "2", 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return graphFetch(url, token);
  }

  if (!res.ok) {
    const err = new Error(`Graph API error: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function graphPatch(url, token, etag, body) {
  const fullUrl = url.startsWith("http")
    ? url
    : `https://graph.microsoft.com/v1.0${url}`;

  const res = await fetch(fullUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "If-Match": etag,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    const err = new Error("Token expired or invalid");
    err.status = 401;
    throw err;
  }

  if (res.status === 409) {
    const err = new Error("Task was modified by someone else. Refresh and try again.");
    err.status = 409;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`Graph API error: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function graphFetchAll(url, token, maxPages = 10) {
  let items = [];
  let nextUrl = url;
  let page = 0;

  while (nextUrl && page < maxPages) {
    const data = await graphFetch(nextUrl, token);
    items = items.concat(data.value || []);
    nextUrl = data["@odata.nextLink"] || null;
    page++;
  }

  return items;
}
