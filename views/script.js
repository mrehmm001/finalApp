


try{
    document.querySelectorAll(".close, #cancel").forEach(c=>{c.addEventListener("click",()=>{
            document.querySelector(".modal-bg").style.display="none";
            document.querySelector(".modal-bg2").style.display="none";
        });
    });
}catch(e){
}


//for toast message



document.addEventListener("DOMContentLoaded",()=>{
    var toast = document.querySelector(".toast");
    setTimeout(()=>{
        try{
            toast.style.visibility="hidden"
        }catch(e){
        
        }

    },5000)
});


try{
    document.querySelector(".closeToast").addEventListener("click",()=>{
        document.querySelector(".toast, .customToast").style.visibility="hidden";
    });
}catch(e){
}

var navOpen = false;
document.querySelector(".hamburgerIcon").addEventListener("click",()=>{
    let nav = document.querySelector(".responsiveNavLinksWrapper");
    navOpen=!navOpen;
    if(navOpen){
        nav.style.visibility = "visible"
        nav.style.opacity="1";
        doOpenMenuAnimation()
    }else{
        doOpenMenuCloseAnimation()
        nav.style.opacity="0";
        setTimeout(()=>{
            nav.style.visibility = "hidden" 
        },500)
    }
});

function doOpenMenuAnimation(){
    let menuButton = document.querySelector(".hamburgerIcon");
    var navLine = menuButton.querySelectorAll(".line")
    navLine[1].style.visibility="hidden"
    var deg = 25;
    navLine[2].style.transform = "translateY(-250%)";
    navLine[0].style.transform = "translateY(250%)";
    navLine[2].style.transformOrigin = "center center";
    navLine[0].style.transformOrigin = "center center";


    setTimeout(()=>{
  
        
        navLine[2].style.transform = "rotate(" + deg + "deg)";
        navLine[0].style.transform = "rotate(" + -deg + "deg)";
    },200)


}

function doOpenMenuCloseAnimation(){
    let menuButton = document.querySelector(".hamburgerIcon");
    var navLine = menuButton.querySelectorAll(".line")
    navLine[1].style.visibility="visible"
    navLine[2].style.transform = "rotate(0deg)";
    navLine[0].style.transform = "rotate(0deg)";
}

var foodHashMap = {};//object hashmap, used for collecting all the selected food, and later adding their sum together
document.querySelectorAll(".foodCheckBox").forEach(e=>{//event listeners for checkbox
    e.addEventListener("click",()=>calculateTotal(e));
})

document.querySelectorAll(".foodQuantity").forEach(e=>{//event listeners for foodquantityt
    e.addEventListener("input",()=>calculateTotal(e));
})



//Function used for calculations
function calculateTotal(e){
    var parent = (e.parentNode.parentNode);//this retrieves the row of that specific checkbox, the row will contain all the info such as calories, carbs etc

    //storing the totalValue elements into variables, will be used later
    var totalValue = document.querySelector(".totalValue");
    var totalCalories = document.querySelector(".totalCalories");
    var totalCarbs = document.querySelector(".totalCarbs");
    var totalFat = document.querySelector(".totalFat");
    var totalProtein = document.querySelector(".totalProtein");
    var totalSalt = document.querySelector(".totalSalt");
    var totalSugar = document.querySelector(".totalSugar");

    //gets the checkbox of that specific row
    var checkBox = parent.querySelector(".foodCheckBox");

    if(checkBox.checked){

        //adds the selected food info into the hashmap
        //each property is converted into float, since they are string originally, this prevents string concatinations
        foodHashMap[parent.id]={
            quantity : parent.querySelector(".quantity .foodQuantity").value,
            calories : parseFloat(parent.querySelector(".calories").innerHTML),
            carbs : parseFloat(parent.querySelector(".carbs").innerHTML),
            fat : parseFloat(parent.querySelector(".fat").innerHTML),
            protein : parseFloat(parent.querySelector(".protein").innerHTML),
            salt : parseFloat(parent.querySelector(".salt").innerHTML),
            sugar : parseFloat(parent.querySelector(".sugar").innerHTML),

        }
    }else{
        delete foodHashMap[parent.id];// deletes food object from the hashmap, only if it exists and its checkbox was unchecked      
    }

    //a sum object is used , and later will be used to compute the total sum and display the total results to the front end
    var sumMap={
        totalCalories : 0,
        totalCarbs : 0,
        totalFat : 0,
        totalProtein : 0,
        totalSalt : 0,
        totalSugar : 0
    }

    //iterates through the foodHashmap
    for(i in foodHashMap){
        //does the sum process
        var foodObj=foodHashMap[i];
        sumMap.totalCalories+=foodObj.calories*foodObj.quantity;
        sumMap.totalCarbs+=foodObj.carbs*foodObj.quantity;
        sumMap.totalFat+=foodObj.fat*foodObj.quantity;
        sumMap.totalProtein+=foodObj.protein*foodObj.quantity;
        sumMap.totalSalt+=foodObj.salt*foodObj.quantity;
        sumMap.totalSugar+=foodObj.sugar*foodObj.quantity;

    }

    //here the totalValues properties are set to their respective sum values, and the front end is updated
    totalCalories.innerHTML= Math.round(sumMap.totalCalories*100)/100;
    totalCarbs.innerHTML= Math.round(sumMap.totalCarbs*100)/100;
    totalFat.innerHTML= Math.round(sumMap.totalFat*100)/100;
    totalProtein.innerHTML= Math.round(sumMap.totalProtein*100)/100;
    totalSalt.innerHTML= Math.round(sumMap.totalSalt*100)/100;
    totalSugar.innerHTML=Math.round(sumMap.totalSugar*100)/100;
}





document.querySelector("#password").addEventListener("click",()=>{
    var passwordCheckerElement = document.querySelector(".passwordCheckerWrapper");
    passwordCheckerElement.style.display="block";
    console.log(passwordCheckerElement)
})

document.querySelectorAll("#firstname, #lastname, #username, #email").forEach(e =>{e.addEventListener("click",()=>{
        var passwordCheckerElement = document.querySelector(".passwordCheckerWrapper");
        passwordCheckerElement.style.display="none";
        console.log(passwordCheckerElement)
    })
});


document.querySelector("#password").addEventListener("input",()=>{
    var passwordValue = document.querySelector("#password").value;
    var checkerMessage = document.querySelector(".passwordCheckerWrapper p");
    //cases
    var case1="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; //for uppcercase check
    var case2=8;//for length check
    var case3="1234567890"//for number check
    var case4="!£$%^&*@()/.,|[]{}-_+=`¬~#;:<>"; //for symbol check


    var passwordCheckerElement = document.querySelector(".passwordCheckerWrapper");
    var weakBar = passwordCheckerElement.querySelector(".weak");
    var fairBar = passwordCheckerElement.querySelector(".fair");
    var strongBar = passwordCheckerElement.querySelector(".strong");
    var superStrong = passwordCheckerElement.querySelector(".superStrong");
    
    if(passwordValue.length==0){
        weakBar.style.background = "#9e9e9e";
        fairBar.style.background = "#9e9e9e";
        strongBar.style.background = "#9e9e9e";
        superStrong.style.background = "#9e9e9e";
        checkerMessage.innerHTML=""
        checkerMessage.style.display="none"
        return;
    }
    if(passwordValue.length>=case2 && caseChecker(case1,passwordValue) && 
    caseChecker(case3,passwordValue) && caseChecker(case4,passwordValue)){
        weakBar.style.background = "red";
        fairBar.style.background = "yellow";
        strongBar.style.background = "green";
        superStrong.style.background = "darkgreen";
        checkerMessage.innerHTML="SUPER STRONG"
        checkerMessage.style.color="darkgreen"
        checkerMessage.style.display="block"
    }else if(passwordValue.length>=case2 && caseChecker(case1,passwordValue) && 
    caseChecker(case3,passwordValue) && !caseChecker(case4,passwordValue)){
        weakBar.style.background = "red";
        fairBar.style.background = "yellow";
        strongBar.style.background = "green";
        superStrong.style.background = "#9e9e9e";
        checkerMessage.innerHTML="STRONG"
        checkerMessage.style.color="green"
        checkerMessage.style.display="block"

    }else if(passwordValue.length>=case2 && caseChecker(case1,passwordValue) && 
    !caseChecker(case3,passwordValue) && !caseChecker(case4,passwordValue)){
        weakBar.style.background = "red";
        fairBar.style.background = "yellow";
        strongBar.style.background = "#9e9e9e";
        superStrong.style.background = "#9e9e9e";
        checkerMessage.innerHTML="FAIR"
        checkerMessage.style.color="yellow"
        checkerMessage.style.display="block"
    }else if(passwordValue.length<case2 || passwordValue.length>case2 && !caseChecker(case1,passwordValue) && 
    !caseChecker(case3,passwordValue) && !caseChecker(case4,passwordValue)){
        weakBar.style.background = "red";
        fairBar.style.background = "#9e9e9e";
        strongBar.style.background = "#9e9e9e";
        superStrong.style.background = "#9e9e9e";
        checkerMessage.innerHTML="WEAK"
        checkerMessage.style.color="red"
        checkerMessage.style.display="block"
    }
    

})


//password strength checker helper
function caseChecker(caseCheck, password){
    for(var i=0; i<caseCheck.length;i++){
        if(password.includes(caseCheck[i])) return true;
    }
    return false;
}


