# Simplentory
Simplentory is a simple "Inventory Management System".  
This is one of my first projects I ever made, so expect some bugs and poor code. Also, I heavily used ChatGPT to help me implement some features.

## Features
+ Add/Remove product categories
+ Add/Remove products to/from categories
+ Set or change the Quantity of products
+ Set a custom name for your Simplentory instance
+ Select a Theme (Green, Dark, Light)

![Screenshot from the Home page of Simplentory](https://github.com/manolol1/Simplentory/blob/main/simplentory.png)

## How to Install
1. Clone the Repository.
2. Make sure that Node.js is installed. You can download it from https://nodejs.org/
3. Open a Terminal in the Project Folder.
4. Enter ```npm install``` in your Terminal. On Linux, you might need to use ```sudo npm install```.
5. Now, just run ```node index.js```! The database should be created automatically when you don't have one already. Again, on Linux you might need to run it with sudo.
6. Enter the IP of the computer Simplentory is running on. Your Simplentory instance should be up and running!

When you stop the server, just run ```node index.js``` to start it again.

## Manual
Simplentory should be relatively self-explaining.
When you fist set up your Simplentory instance, there should already be a General category with an example product.
You can use the + and - buttons to increase/lower the quantity by one. If you want to set your quantity to a specific value, just enter the value in the input field under "Set Value" and press enter.

If you want to create your own categories, click the "Configure" button. You will be redirected to the Settings page.
On the Settings page und "Manage categories", just enter a Name for your category in the input field and press "Add Category".
To delete a category, press the Delete button next to the category you want to delete in the table below.
When you delete a category, every product in that category will be deleted as well!

You can also set a custom name for your Simplentory instance. This name will be shown in the title of every page and as the headline of the home page.
To set your name, just edit the name in the input field under "Custom Name" and press "Save".

To change your theme, open the drop-down-menu under "Theme", select one and press "Save".
