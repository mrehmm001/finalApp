----------READ ME----------
I designed and developed a calorie counter website as part of my finalapp project. I used mongodb as the backend database, here are my collections are:

users [_id,  firstname, lastname, username, email, password]
food[_id, name, value, unit, calories, carbs, fat, protein, salt, sugar, image, author]


----------HOME PAGE----------

R1: Home page:
The home page does its purpose by giving a good first impression of the website. The homepage also has the navigation links which goes towards all other pages. I also messed around with EJS, essentially making all my web pages EJS since I want to dynamically render pages using data sent from the back end. 

R1A: Display the name of the web application. 
Implemented in file: home.ejs LINE 99

R1B:  Display links to other pages or a navigation bar that contains links to other pages.
Implemented in file: home.ejs Line 116 to 124  , and 66 to 74 for the responsive navbar

other features
when you login, the sign in & sign out button at the very top of the website are replaced with “Hello! USERNAME | Sign Out” which I thought was a nice tough to have because it shows the user that you are logged in, you can clearly see how this is happening in line 103 in Home.ejs.

----------ABOUT PAGE----------
ABOUT PAGE
R2: About page:
The about page is a very simple page and it is there to explain the whole purpose of this fake organisation I made up. It’s also EJS since it has the dynamic login / register & user / sign out feature, which all pages has.
Implemented in file : about.ejs LINE 119 to 128
----------REGISTER PAGE----------
R3: Register page:
R3A: Display a form to users to add a new user to the database. The form should consist of the following items: first name, last name, email address, username, and password.  Display a link to the home page or a navigation bar that contains links to other pages.
Implemented in file: register.ejs LINE 131 to 153

R3B:  Collect form data to be passed to the back-end (database) and store user data in the database. Each user data consists of the following fields: first name, last name, email address, username and password. To provide security of data in storage, a hashed password should only be saved in the database, not a plain password.
Fully implemented in file: main.js LINE 42 to 99

R3C: Display a message indicating that add operation has been done.
Implemented a toast message notification feature which uses ejs variable to display success message.
This is clearly shown in register.ejs LINE 14 to 18
and in the back end, main.js LINE 87

other features
I implemented a password strength checker used javascript, the code for it is included in script.js LINE 166 to 241

----------LOGIN IN----------
R4: Login page:
R4A: Display a form to users to log in to the dynamic web application. The form should consist of the following items: username and password.  Display a link to the home page or a navigation bar that contains links to other pages.
Fully functional and implemented in loginPage.ejs LINE 137 to 145, navigation bar used to display to all other linkes

R4B: Collect form data to be checked against data stored for each registered user in the database. Users are logged in if and only if both username and password are correct.
Implemented in file : main.js Line 102 to 144

R4C: Display a message indicating whether login is successful or not and why not successful.
Exact same functionality as register page, toast message is displayed to confirm the user that they have logged in or failed to login.  

Other features
When the user successfully logs in, their username is shown above to let them know that they are logged in, the login and register buttons then get hidden, and logout button is shown,  until they log out.

----------LOGOUT----------
R5: Logout
There is a way to logout, a message is displayed upon successful logout.
When the user clicked Sign out, they are sent to the home page, and a Toast notification message “Logged out” is shown to confirm that they’ve logged out, also their username will no longer show at above, instead it will show “Log in | Sign up”
Implemented in file : main.js Line 157 to 362
----------ADD FOOD PAGE----------
R6: Add food page (only available to logged-in users):
Add food page displays a form to the user, the inputs all have HTML5 attributes such as required (can submit without filling out everything), hints (to help the user know what to enter) and restricted types to prevent them from entering anything other than the required type e.g number only. But I did also add back end form validation as a mean of two way form validation, 100% ensuring what’s inputted is valid.
R6A: Display a form to users to add a new food item to the database. The form should consist of the following items: name, typical values, unit of the typical value, calories, carbs, fat, protein, salt, and sugar.  Display a link to the home page or a navigation bar that contains links to other pages.
Implemented in file addFood.ejs LINE 136 to 152

R6B:  Collect form data to be passed to the back-end (database) and store food items in the database. Each food item consists of the following fields: name, typical values, unit of the typical value, calories, carbs, fat, protein, salt, and sugar. Here is an example of a food item:

name: flour, typical values per:100, unit of the typical value: gram, calories:  381 kilocalories, carbs: 81 g, Fat: 1.4 g, Protein: 9.1 g, salt: 0.01 g, and sugar: 0.6 g. The unit of the typical value may have values such as gram, liter, tablespoon, cup, etc. Going beyond by saving the username of the user who has added this food item to the database.
fully Implemented in file main.js LINE 147 to 188
R6C: Display a message indicating that add operation has been done.
A message is displayed , implemented from back end main.js LINE 185 and front end addFood.ejs LINE 14 to 18


 ----------SEARCH FOOD PAGE ----------
R7: Search food page
R7A: Display a form to users to search for a food item in the database. 'The form should contain just one field - to input the name of the food item'. Display a link to the home page or a navigation bar that contains links to other pages.
Implemented in searchFood.ejs LINE 136 to 142

R7B:  Collect form data to be passed to the back-end (database) and search the database based on the food name collected from the form. If food found, display a template file (ejs, pug, etc) including data related to the food found in the database to users; name, typical values, unit of the typical value, calories, carbs, fat, protein, salt, and sugar. Display a message to the user, if not found.
Implemented back end process in file main.js LINE 191 to 220
Front end implementation in searchfood.ejs LINE 136 to 142

R7C: Going beyond, search food items containing part of the food name as well as the whole food name. As an example, when searching for ‘bread’ display data related to ‘pitta bread’, ‘white bread’, ‘wholemeal bread’, and so on.
fully implemented 

----------UPDATE FOOD PAGE----------
R8: Update food page (only available to logged-in users)
R8A: Display search food form. Display a link to the home page or a navigation bar that contains links to other pages.
Fully implemented in file updateFood LINE 232 to 238

R8B: If food found, display data related to the food found in the database to users including name, typical values, unit of the typical value, calories, carbs, fat, protein, salt, and sugar in forms so users can update each field. Display a message to the user if not found. Collect form data to be passed to the back-end (database) and store updated food items in the database. Display a message indicating the update operation has been done. You can go beyond this requirement by letting ONLY the user who created the same food item update it.
Fully implemented in front end file updateFood.ejs LINE 143 to 190 for update section 
Back end implementation in file main.js LINE  255 to 311


R8C: Implement a delete button to delete the whole record, when the delete button is pressed, it is good practice to ask 'Are you sure?' and then delete the food item from the database, and display a message indicating the delete has been done. You can go beyond this requirement by letting ONLY the user who created the same food item delete it.
fully implemented in file updateFood.ejs LINE 206 to 217 for delete section. User gets a modal popup message like “are you sure”, they have option to cancel it. I also made it so that only the user who created the food can edit and delete, I made this check both, front end and back end.

other features
I used advance search which results with list of food which the user can edit or delete, I thought this was a good feature to have.

R9: List food page (available to all users)
R9A: Display all foods stored in the database including name, typical values, unit of the typical value, calories, carbs, fat, protein, salt, and sugar, sorted by name. Display a link to the home page or a navigation bar that contains links to other pages.
Fully implemented in file listFood.ejs LINE 166 to 204, also includes navigation links

R8B: You can gain more marks for your list page is organised in a tabular format instead of a simple list.
I used HTML table format, and designed it using CSS

R9C: going beyond by letting users select some food items (e.g. by displaying a checkbox next to each food item and letting the user input the amount of each food item in the recipe e.g. 2x100 g flour). Then collect the name of all selected foods and calculate the sum of the nutritional information (calories, carbs, fat, protein, salt, and sugar) related to all selected food items for a recipe or a meal and display them as ‘nutritional information and calorie count of a recipe or a meal’. Please note, it is not necessary to store recipes or meals in the database.
Fully implemented, I used javascript to which was used to compute the total, this can be seen in file script.js LINE 84 to 159

 
 ----------API----------
R10: API
There is a basic API displayed on '/api' route listing all foods stored in the database in JSON format. i.e. food content can also be accessed as JSON via HTTP method, It should be clear how to access the API (this could include comments in code). Additional credit will be given for an API that implements get, post, push and delete.
Fully implemented and included get, post, push and delete. Mentioned in file main.js in API section towards the end of the file.


R11: form validation
All form data should have validations, examples include checking password length, email validation, integer data is integer and etc.
Form validation was added to the routes : register_submitted, foodAdded, updateFood & /api/post in main.js

R12: Your dynamic web application must be implemented in Node.js on your virtual server. The back-end of the web application could be MongoDB or MySQL. Make sure you have included comments in your code explaining all sections of the code including database interactions.
requirement met





