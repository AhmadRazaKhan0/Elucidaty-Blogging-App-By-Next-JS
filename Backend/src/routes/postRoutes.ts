import { Router } from "express";
import * as c from "../controllers/postController";

const router = Router();
router.route("/").get(c.list).post(c.create);
router.get("/:id/related", c.related);
router.route("/:id").get(c.getOne).put(c.update).patch(c.update).delete(c.remove);
export default router;
