/*
 * really kinky code, might break sometimes 
 * 
*/
let js = require('jsearch'); // npm i --save jsearch

let username = "lani"; // username we want to find

// using google, bing gives out only microsoft pages and yandex rate limits you after 2 requests (but was the most accurate and was fiding most of the users)
js.google(`${username}-onetap`, 0, (response) => {
    let reg = new RegExp(`${username.toLowerCase()}.[0-9]+`, "g"); // regular expression (pattern => username.uid)

    let response_text = response.toString()  // convert array of results to string
                .match(reg)                 //  grab all matching strings and compare it to the regexp we made
                .toString()                //   convert another array of results to string
                .match(/\.[0-9]+/g)[0]    //    use regular expression to find uid in string (pattern => uid)
                .substring(1);           //     delete the first character (dot)
    console.log(response_text)          //      print out the result
});
