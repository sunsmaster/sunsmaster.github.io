class Pengar {
    constructor(antal, pengarsort) {
        this.antal = antal
        this.pengarsort = pengarsort
    }
}

/**
 * exChange
 * in: belopp som ska växlas, valör på sedeln
 * out: antal sedlar eller mynt
 */

function exChange(belopp, sedel) {
    return Math.floor(belopp / sedel)
}

/**
 * getchangeArray()
 * in: inbetalt belopp
 * out: array innehåller antal mynt i varge valör
 */
function getExchangeArray(inbetalning, priset) {
    let antal_mynt = 0
    let pengar_tillbaka = 0

    sedlar_mynt_array = []

    //500--------
    pengar_tillbaka = inbetalning - priset
    antal_mynt = exChange(pengar_tillbaka, 500)
    pengar_tillbaka = pengar_tillbaka % 500
    console.log(`antal= ${antal_mynt}`)
}

const input_pris = document.getElementById("pris")
const input_inbet = document.getElementById("inbet")

const svardi = document.getElementById("svar_div")

const kalkyeralknapp = document.getElementById("kalk_knapp")
kalkyeralknapp.addEventListener("click", kalkyleraClick)

function kalkyleraClick(e){
    console.log(`klick`)
    let t_pris = parseInt(input_pris.value)
    let t_inbet = parseInt(input_inbet.value)
    getExchangeArray(t_inbet, t_pris)
}
