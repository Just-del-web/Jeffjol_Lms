import { Router } from "express";
import * as ParentController from "../controllers/parent.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/my-children",
  restrictTo("parent"),
  ParentController.getMyChildrenDashboard,
);

router.get("/linked-children", ParentController.getChildrenList);
export default router;
