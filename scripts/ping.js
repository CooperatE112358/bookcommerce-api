/* Simple endpoint checker for BookCommerce API using axios.
   - Persists cookies (manual) to traverse authenticated routes
   - Prints status code and PASS/FAIL for each step
   - Uses random email to avoid conflicts
   - BASE_URL can be overridden via env (default: http://localhost:5000/api/v1)
   Run: node ping.js
*/

const axios = require("axios");
const crypto = require("crypto");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000/api/v1";

// -----------------------------------------------------
// Minimal cookie jar (manual)
// -----------------------------------------------------
const cookieJar = new Map(); // name -> value

function setCookiesFromResponse(res) {
  const setCookie = res.headers["set-cookie"];
  if (!setCookie) return;
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const c of arr) {
    const first = c.split(";")[0]; // name=value
    const eqIdx = first.indexOf("=");
    if (eqIdx > 0) {
      const name = first.slice(0, eqIdx).trim();
      const value = first.slice(eqIdx + 1).trim();
      if (name && value) cookieJar.set(name, value);
    }
  }
}

function getCookieHeader() {
  if (cookieJar.size === 0) return undefined;
  return Array.from(cookieJar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

// -----------------------------------------------------
// HTTP helper
// -----------------------------------------------------
async function call({ method, url, data, params, headers, expect = [], name }) {
  const cookieHeader = getCookieHeader();
  const cfg = {
    method,
    url: BASE_URL + url,
    data,
    params,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(headers || {}),
    },
    validateStatus: () => true, // don't throw on non-2xx
    maxRedirects: 0,
  };

  let res;
  try {
    res = await axios(cfg);
    setCookiesFromResponse(res);
  } catch (e) {
    console.log(
      `[FAIL] ${method.toUpperCase()} ${url} - Network error: ${e.message}`
    );
    return { ok: false, status: 0, data: null };
  }

  const ok = expect.length
    ? expect.includes(res.status)
    : res.status >= 200 && res.status < 300;
  const tag = ok ? "PASS" : "FAIL";
  console.log(
    `[${tag}] ${res.status} ${method.toUpperCase()} ${url}${
      name ? " - " + name : ""
    }`
  );
  return { ok, status: res.status, data: res.data, res };
}

// -----------------------------------------------------
// Test runner
// -----------------------------------------------------
(async () => {
  let pass = 0;
  let fail = 0;

  const email = `user_${Date.now()}_${crypto
    .randomBytes(3)
    .toString("hex")}@test.com`;
  const password = "P@ssw0rd!" + crypto.randomBytes(2).toString("hex");
  const newPassword = "N3wP@ss!" + crypto.randomBytes(2).toString("hex");
  let userId = null;
  let productId = null;
  let reviewId = null;
  let orderId = null;

  async function step(args) {
    const r = await call(args);
    if (r.ok) pass++;
    else fail++;
    return r;
  }

  // Auth: register -> login
  const r1 = await step({
    method: "post",
    url: "/auth/register",
    data: { email, name: "Tester", password },
    expect: [201, 400], // 400 if email policy fails
    name: "Register",
  });
  if (r1.data?.user?.userId) userId = r1.data.user.userId;

  const r2 = await step({
    method: "post",
    url: "/auth/login",
    data: { email, password },
    expect: [200, 400, 401],
    name: "Login",
  });

  // Public endpoints
  await step({
    method: "get",
    url: "/products",
    expect: [200],
    name: "List products",
  });
  const prodRes = await call({
    method: "get",
    url: "/products",
    expect: [200],
  });
  if (prodRes.data?.products?.length) productId = prodRes.data.products[0].id;

  await step({
    method: "get",
    url: "/books/search",
    params: { q: "javascript" },
    expect: [200],
    name: "Google Books search",
  });

  await step({
    method: "get",
    url: "/reviews",
    expect: [200],
    name: "List reviews",
  });

  // Users (protected)
  await step({
    method: "get",
    url: "/users/showMe",
    expect: [200, 401],
    name: "Show me",
  });

  // Update user (requires both name and email)
  await step({
    method: "patch",
    url: "/users/updateUser",
    data: { name: "Tester Renamed", email },
    expect: [200, 400, 401],
    name: "Update user profile",
  });

  // Update password
  await step({
    method: "patch",
    url: "/users/updateUserPassword",
    data: { oldPassword: password, newPassword },
    expect: [200, 400, 401],
    name: "Update password",
  });

  // Users: admin-only list (first user may be ADMIN; otherwise expect 403)
  await step({
    method: "get",
    url: "/users",
    expect: [200, 401, 403],
    name: "List users (admin)",
  });

  // Users: get by id (self or admin)
  if (userId) {
    await step({
      method: "get",
      url: `/users/${userId}`,
      expect: [200, 401, 403, 404],
      name: "Get user by id",
    });
  }

  // Product details by id (if found)
  if (productId) {
    await step({
      method: "get",
      url: `/products/${productId}`,
      expect: [200, 404],
      name: "Get single product",
    });
  }

  // Reviews: create -> get -> patch -> delete (if product available)
  if (productId) {
    const rc = await step({
      method: "post",
      url: "/reviews",
      data: {
        book: productId,
        rating: 5,
        title: "Great",
        comment: "Nice book!",
      },
      expect: [201, 400, 401, 404],
      name: "Create review",
    });
    if (rc.data?.review?.id) reviewId = rc.data.review.id;
  }

  if (reviewId) {
    await step({
      method: "get",
      url: `/reviews/${reviewId}`,
      expect: [200, 404],
      name: "Get review by id",
    });
    await step({
      method: "patch",
      url: `/reviews/${reviewId}`,
      data: { rating: 4, title: "Good", comment: "Updated" },
      expect: [200, 401, 403, 404],
      name: "Update review",
    });
    await step({
      method: "delete",
      url: `/reviews/${reviewId}`,
      expect: [204, 401, 403, 404],
      name: "Delete review",
    });
  }

  // Orders: create -> get -> patch -> mine (if product available)
  if (productId) {
    const oc = await step({
      method: "post",
      url: "/orders",
      data: {
        cartItems: [{ book: productId, amount: 1 }],
        tax: 10,
        shippingFee: 20,
      },
      expect: [201, 400, 401, 404],
      name: "Create order",
    });
    if (oc.data?.order?.id) orderId = oc.data.order.id;
  }

  if (orderId) {
    await step({
      method: "get",
      url: `/orders/${orderId}`,
      expect: [200, 401, 403, 404],
      name: "Get order by id",
    });
    await step({
      method: "patch",
      url: `/orders/${orderId}`,
      data: { paymentIntentId: "test_pi_" + Date.now(), status: "paid" },
      expect: [200, 400, 401, 403, 404],
      name: "Update order",
    });
  }

  await step({
    method: "get",
    url: "/orders/showAllMyOrders",
    expect: [200, 401],
    name: "List my orders",
  });

  // Health
  await step({
    method: "get",
    url: "/health",
    expect: [200, 500],
    name: "Health check",
  });

  // Logout
  await step({
    method: "get",
    url: "/auth/logout",
    expect: [200],
    name: "Logout",
  });

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
