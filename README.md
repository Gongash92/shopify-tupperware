# Pokretanje 
`npm install`

podesiti themekit creditentials u config.yml


# Struktura 
Svi page.liquid fajlovi su preimenovani na srpski. isto tako i link do njih.

`theme watch` spajanje sa shopify temom tokom rada

`gulp watch` gulp pokretanje radi kompajlovanja css, js

`assets` —> svi media fajlovi idu ovde, slike, snimci, ikonice itd.
U assets se zavrsva css.min i js.min od gulpa.

css vuce iz `node_modules > codyhouse` + `scss > components`

js isto vuce iz `node_modules > codyhouse` + `js > components` 

js i css komponente od codyhousa koje nudi. lake su za promenu ili bilo kakvo manipulisanje

`layout` za sve stranice

`sections` tu je header, footer i sekcije za stranicu pocetnu. Tu pravi sekcije za ostale stranice tako sto ces prvo napraviti folder pod imenom stranice i u njoj sekcije za tu stranicu. u rootu `sections` foldera idu samo header footer i pocetna

`templates` ovde idu sve stranice, proizvodi itd. 
Pravljenje novog proizvoda —> mora prvo prefix product da ima `product.{naziv-proizvoda}.liquid` 
`product.liquid` sluzi kao osnova ali se ne koristi uopste.
`index.liquid` je pocetna

# Vue

Vue je integrisan kao skripta, koristi se unutar liquid fajlova poziva se kao `<script></script>` tag. Kolekcije i filtriranja i pozivanje proizvoda je uradjeno preko Vue radi button-a 
add to cart.

collection > filtriranje radi na principu da gadja tagove koji su postavljeni u shopify > products > tags
input value = ime taga

### store.js.liquid
Koristimo vuex sotre. u njemu je globalni kontenjer koji ima u sebi vrijednost korpe i funkcije za rad sa korpom koje preuzimaju stanje iz korpe i dalje rade.. dodavanje brisanje update korpe. On je globalan na svim stranicama i dostupan u svakom momentu.
