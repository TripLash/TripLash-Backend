const express = require("express");
const router = express.Router();
const protect = require("../util/middlewares");
const faviorateController = require("./../Controllers/faviorateController");

router.post("/create-List", protect(["client" , "guide"]) , faviorateController.createList);
router.patch("/update-list/:listId", faviorateController.UpdateList);
router.delete("/delete-list/:listId", faviorateController.deleteList);
router.get("/get-list/:listId", faviorateController.getList);
router.get("/get-all-lists", faviorateController.getAllLists);
router.get("/get-user-lists" , protect(['client']) , faviorateController.getUserLists);
router.delete("/delete-list-tour/:listId" , faviorateController.deleteTourList);

module.exports = router;
