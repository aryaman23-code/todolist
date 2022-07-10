//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
//this requiring all the modules 

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//creating a db with mognodb 
mongoose.connect("mongodb+srv://admin-aryaman:Aryaman2535@cluster0.upv7uyi.mongodb.net/todolistDb",{useNewUrlParser:true});
const itemsSchema = {
  name: String
  };
const Item = mongoose.model("Item", itemsSchema);

const item1=new Item({
  name:"welcome to your todolistDb"
});

const item2=new Item({
  name:"Hit the + button to add a new item"
});

const item3=new Item({
  name:"<-- Hit this to delete an item "
});

const defaultItems=[item1,item2,item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
  };
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {



Item.find({},function(err,foundItems){
  //the find part has no particular condiitoin and heance we are trying to search all items also remember it is returnnun an array 
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully saved default items to the DB ");
        }

        res.redirect("/");
        //this basically works like a refresh think about it 
      });
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }
});
 

});

app.post("/", function(req, res){
 

  const itemName= req.body.newItem;
  const listname= req.body.list;
  const item=new Item({
    name: itemName
  });
  if(listname==="Today"){
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listname},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listname);
    });
  }
 
});



app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err,item){
      if(!err)
      {
        console.log("succesfully deleted the item");
        res.redirect("/");
      }
    });

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });


  }
 
  
});
//making use of express react routing parameters
app.get("/:customListName", function(req,res){

  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        //creat a new list 
        const list=new List(
          {
            name:customListName,
            items:defaultItems
          }
          );
          list.save();
          res.redirect("/"+customListName);
        
      }
      else
      {
        //redirect to existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
 
app.listen(port, function() {
  console.log("Server started succesfully");
});  