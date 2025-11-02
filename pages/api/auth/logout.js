import { createRouter } from "next-connect";
import cookie from "cookie";

const router = createRouter();

router.post(async (req,res) => {
  // Clear cookie
  res.setHeader('Set-Cookie', cookie.serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  }));

  res.json({ success: true, message: "Logged out" });
});

export default router.handler();

