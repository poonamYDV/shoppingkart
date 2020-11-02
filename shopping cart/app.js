var express=require('express');
var app=express();
var path=require('path');

let mongo=require('mongodb').MongoClient;
let parser=require('body-parser');
let url='mongodb://localhost:27017/';
var admin=null;
var user=null;
var cart=null;
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'public/html/index.html'));
});
app.get('/html/adminLogin.html',function(req,res){
    res.sendFile(path.join(__dirname,'public/html/adminLogin.html'));
});
app.get('/admin.html',function(req,res){
    res.sendFile(path.join(__dirname,'public/html/admin.html'));
});

app.get('/myCart.html',function(req,res){
    res.sendFile(path.join(__dirname,'public/html/myCart.html'));
});

app.use(express.static(path.join(__dirname,'public')));
app.listen(3000,function(err)
{
	if(err)
		console.log('Error in Connecting to Server');
	else
		console.log('Server Listening at port 3000.');
});


app.post('/adminLogin',parser.json(),async function (req,res)
{ 
    
    var a=await find(req);
    res.json({k:a});
  });
 async function  find(req)
{
const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
client.connect();
var t=await client.db(req.body.db).collection('data').findOne({id:req.body.mail,password:req.body.password});
console.log(t);
admin=t;
return t;
}
app.post('/dataAdmin',parser.json(),async function (req,res)
{ 
    
  res.json({k:admin});
});

app.post('/dataUser',parser.json(),async function (req,res)
{ 
    
  res.json({k:user});
});

app.post('/changePassword',parser.json(),async function (req,res)
{ 
const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
client.connect();
var t=await client.db(req.body.db).collection('data').findOneAndUpdate({password:req.body.old},{$set:{password:req.body.new}},{returnOriginal:false});
if(t.value==null)
{
	console.log('here');
	res.json({l:'Old Password Is not Correct'});
}
else
{
    console.log('There');
    res.json({l:'Password changed SucessFully'});	
}
});

app.post('/addItem',parser.json(),async function (req,res)
{ 
     const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
     client.connect();
     var t=await client.db(req.body.db).collection('data').findOne({name:req.body.name});
     if(t==null)
     {
         var updated=await client.db(req.body.db).collection('data').insertOne({name:req.body.name,description:req.body.description,q:parseInt(req.body.quantity),p:parseInt(req.body.price),i1:req.body.image1,i2:req.body.image2,i3:req.body.image3,i4:req.body.image4});
         res.json({l:'Item added'});
     }
     else
     {
     	res.json({l:'Item Already Exists'});
     }
  
});
 

app.post('/removeItem',parser.json(),async function (req,res)
{ 
     const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
     client.connect();
     var t=await client.db(req.body.db).collection('data').findOne({name:req.body.name});
     if(t==null)
     {
         
         res.json({l:'Item not Found'});
     }
     else
     {
     	var n=await client.db(req.body.db).collection('data').deleteOne({name:req.body.name});
     	res.json({l:'Item Deleted'});
     }
  
});

app.post('/find',parser.json(),async function (req,res)
{ 
     const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
     client.connect();
     var t=await client.db(req.body.db).collection('data').findOne({name:req.body.name});
     res.json({k:t,l:'Item not found'});
});

app.post('/allFind',parser.json(),async function (req,res)
{ 
     const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
     client.connect();
     var t=await client.db(req.body.db).collection('data').find();
     t.toArray(function(e,arr)
     	{
     	  res.json({k:arr});	
     	});
     
});

app.post('/signUp',parser.json(),async function (req,res)
{ 
     const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
     client.connect();
      var updated=await client.db(req.body.db).collection('data').insertOne({id:req.body.mail,password:req.body.password,profileImage:req.body.profileImage});
      res.json({l:'SignUp done!'});
     
});

app.post('/findUser',parser.json(),async function (req,res)
{ 
     const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
     client.connect();
      var updated=await client.db(req.body.db).collection('data').findOne({id:req.body.mail});
      res.json({k:updated,l:'User Already Exist. Try Login'});
     
});

app.post('/userLogin',parser.json(),async function (req,res)
{ 
     
const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
client.connect();
var t=await client.db(req.body.db).collection('data').findOne({id:req.body.mail,password:req.body.password});
console.log(t);
user=t;
cart=new Set();
  res.json({k:t});

});

app.post('/logoutUser',parser.json(),async function(req,res)
{
	user=null;
    cart=null;
	res.json();
});



app.post('/addCart',parser.json(),async function(req,res)
{
    if(cart.has(req.body.x))
    {
        res.json({l:'Item Already Added'});
    }
    else
    {
        cart.add(req.body.x);
        res.json({l:'Item Added to Cart'});
    }
});

app.post('/dataCart',parser.json(),async function(req,res)
{
   res.json({k:Array.from(cart)});
});

app.post('/deleteItem',parser.json(),async function(req,res)
{
    for(i of cart)
    {
        if(i.name==req.body.x.name)
        {
            cart.delete(i);
        }
    }
    console.log('here');
    console.log(cart);
   res.json({k:null});
});

app.post('/updateItem',parser.json(),async function (req,res)
{ 
     
const client = new mongo(url,{ useNewUrlParser: true, useUnifiedTopology: true });
client.connect();

 var s=await client.db(req.body.db).collection('data').findOne({name:req.body.name}); 
 if(s.q<req.body.q)
 {
    res.json({k:false,l:`Sorry, That Quantity of ${s.name} is not present in Cart`});
 }
 else
 {
    var m=await client.db(req.body.db).collection('data').findOneAndUpdate({name:req.body.name},{$set:{q:s.q-parseInt(req.body.q)}},{returnOriginal:false});
    console.log(m);
    res.json({k:true});
 }

});

app.post('/removeCart',parser.json(),async function (req,res)
{ 
     
   cart=new Set();
   res.json({k:true});

});

