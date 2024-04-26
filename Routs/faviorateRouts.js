const express = require("express");
const router = express.Router();
const protect = require("../util/middlewares");
const faviorateController = require("./../Controllers/faviorateController");

router.post(
  "/createList/",
  protect(["guide", "client"]),
  faviorateController.createList
);
router.patch("/updateList/:listId", faviorateController.UpdateList);
router.delete("/deleteList/:listId", faviorateController.deleteList);
router.get("/getList/:listId", faviorateController.getList);
router.get("/getAllLists/", faviorateController.getAllLists);
router.get("/getUserLists/", faviorateController.getUserLists);

module.exports = router;
