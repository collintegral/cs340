'use strict'

// Get inventory item list based on selected classification_id
let classificationList = document.querySelector("#classificationList");
classificationList.addEventListener("change", () => {
    let classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);
    let classIdURL = "/inv/getInventory/" + classification_id;

    fetch(classIdURL).then(response => {
        if (response.ok) {
            return response.json();
        } throw Error("Network response was not OK.");
    }).then(data => {
        console.log(data);
        buildInventoryList(data);
    }).catch(error => {
        console.log("There was a problem: " + error.message);
    });
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
    let inventoryDisplay = document.getElementById("inventoryDisplay");
    //Set up table labels
    let dataTable = '<thead>';
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
    dataTable += '<thead>';

    // Set up table body
    dataTable += '<tbody>';

    // Iterate over data to generate rows
    data.forEach(element => {
        dataTable += `<tr><td class="vehicle-name">${element.inv_make} ${element.inv_model}</td>`;
        dataTable += `<td class="submit-cont"><a href='/inv/manage/edit/${element.inv_id}' class="button inv-button" title='Click to Update'>Modify</a></td>`;
        dataTable += `<td class="submit-cont"><a href='/inv/manage/delete/${element.inv_id}' class="button inv-button" title='Click to Delete'>Delete</a></td></tr>`;
    });
    dataTable += '</tbody>';

    //Display contents in Inventory Management View
    inventoryDisplay.innerHTML = dataTable;
}