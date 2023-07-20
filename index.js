import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const baseURI = "https://www.thecocktaildb.com/api/json/v1/1/";
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

let data = {};
let fetchData = true;
let resFetchId = "";

app.get("/", async (req,res) => {
try {
    if (fetchData === true) {
        data = {};
        const getDrinkType = await axios.get(`${baseURI}list.php?a=list`);
        const getIngredientList = await axios.get(`${baseURI}list.php?i=list`);
        
        data = {
            drinkChoice: getDrinkType.data.drinks,
            ingredientList: getIngredientList.data.drinks,
   
        }
    }

res.render("index.ejs", {data: data});
} catch (error) {
    console.error(error.message);
}

});



app.post("/makeDrink",async (req,res) =>{
    const choice = req.body.searchBy;
    let choiceValue = req.body.choiceMade;
    if (choiceValue === "None") {
        resFetchId = await axios(`${baseURI}random.php`);
        await getDetails();
    } else {
        switch (choice) {
            case "1": //Choice of Drink
                console.log(`${baseURI}filter.php?a=${choiceValue}`);
                resFetchId = await axios(`${baseURI}filter.php?a=${choiceValue}`);
                await getDetails();
            
                // console.log(resData);
            
                break;
            case "2": //Choice of Ingredient
                resFetchId = await axios(`${baseURI}filter.php?i=${choiceValue}`);
                await getDetails();

   

                break;
            default:
                break;
        }
    }
    fetchData = false;
    res.redirect("/");
})

app.post("/randomDrink", async (req, res) => {
     resFetchId = await axios(`${baseURI}random.php`);
    await getDetails();

     fetchData = false;
    res.redirect("/");
    
});


app.listen(port, ()=>{
    console.log(`Server is up on ${port}`);
})

async function getDetails() {
    const randomDrinkId = resFetchId.data.drinks[Math.floor(Math.random(resFetchId.data.drinks) * resFetchId.data.drinks.length)].idDrink;
            
            const resDet = await axios(`${baseURI}lookup.php?i=${randomDrinkId}`);
            const resData = resDet.data.drinks[0];

            data.drinkName = resData.strDrink;
            data.instructions = resData.strInstructions;
            data.image = resData.strDrinkThumb;

            data.ingredients = [];
            for (let i = 1; i < 16; i++){
                let ingrStr = "strIngredient" + i;
                let measureStr = "strMeasure" + i;
                let instructionStr = "";

                if (resData[ingrStr]) {
                    if (resData[measureStr] == null) {
                        instructionStr =  + resData[ingrStr];
                    } else {
                       instructionStr = resData[measureStr] + " " + resData[ingrStr]; 
                    }
                    
                    data.ingredients.push(instructionStr);
                }
            }
            
}