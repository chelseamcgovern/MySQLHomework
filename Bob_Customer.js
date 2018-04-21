var inquirer = require('inquirer'); 
var mysql = require('mysql'); 

var amountOwed; 
var currentDepartment; 
var updateSales; 

var connection = mysql.createConnection({ 
	host: 'localhost', 
	port: 3306, 
	user: 'root',
// Your password here or 'rr113read' if using my database
	password: '1301o', 
	database: 'Bamazon' 
}); 
 
//Connection to the database
connection.connect(function(err){ 
	if (err) throw err; 
	console.log('connected as : ' + connection.threadId) 
}); 

 
//Place Functions Here 
//********************
 
//ShowProducts
//Display all available store items available
//Then calls PlaceOrder function 
function ShowProducts(){ 
	connection.query('SELECT * FROM product_name', function(err, res){ 
		if (err) throw err; 
		console.log('********************************************************');
		console.log('********************************************************');
		console.log('**                  Bamazon Mercantile                **');
		console.log('**                     Product list                   **'); 
		console.log('********************************************************');
		console.log('********************************************************'); 

		for(i=0;i<res.length;i++){ 
			console.log('Product ID:' + res[i].item_id + ' Product: ' + res[i].product_name + ' Price: ' + '$' + res[i].price + '(Quantity left: ' + res[i].stock_quantity + ')') 
		} 
		console.log('---------------------------------------------------------'); 
		PlaceOrder(); 
		}) 
} 

 
//PlaceOrder
//Prompts the user to place an order
//Fill the order, if possible
//Then call OrderAgain function 
function PlaceOrder(){ 
	inquirer.prompt([{ 
		name:    'SelectId', 
		message: 'Enter Product ID of product you wish to buy', 
		validate: function(value){ 
			var valid = value.match(/^[0-9]+$/) 
			if(valid){ 
				return true 
			} 
				return 'Please enter a valid Product ID' 
		} 
	},{ 
		name:    'SelectQuantity', 
		message: 'How many of these would you like?', 
		validate: function(value){ 
			var valid = value.match(/^[0-9]+$/) 
			if(valid){ 
				return true 
			} 
 				return 'Okay... you need to enter a whole number for the quantity.' 
		} 
	}]).then(function(answer){ 
	connection.query('SELECT * FROM product_name WHERE id = ?', [answer.selectId], function(err, res){ 
 		if(answer.SelectQuantity > res[0].stock_quantity){ 
			console.log('Not enough in stock.'); 
			console.log('Order not processed.'); 
			console.log(''); 
			OrderAgain(); 
		} 
		else{ 
			AmountOwed = res[0].price * answer.SelectQuantity; 
			currentDepartment = res[0].DepartmentName; 
			console.log('Thank you for your order'); 
			console.log('Please pay $' + AmountOwed); 
			console.log(''); 
			//update product table 
			connection.query('UPDATE product SET ? Where ?', [{ 
				StockQuantity: res[0].stock_quantity - answer.SelectQuantity 
			},{ 
				id: answer.selectId 
			}], function(err, res){}); 
			//update departments table 
			logSaleToDepartment(); 
			OrderAgain(); 
		} 
	}) 

 }, function(err, res){}) 
}; 

//NewOrder
//Allow a new order to be placed
//Or end the connection 
function OrderAgain(){ 
	inquirer.prompt([{ 
		type:    'confirm', 
		name:    'choice', 
		message: 'Would you like to place another order?' 
	}]).then(function(answer){ 
		if(answer.choice){ 
			placeOrder(); 
		} 
		else{ 
			console.log('Thank you for shopping at the Bamazon Mercantile!'); 
			connection.end(); 
		} 
	}) 
}; 


//Call the original function (all other functions are called within this function) 
//====================================================================== 
ShowProducts(); 
