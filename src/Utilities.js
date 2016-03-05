/**
 * Created by khainguyen on 3/4/2016.
 */

/**
 * Return the object with the ID in the array.
 * @param ID: the ID of the object we are looking for
 * @param array: the array which holds the object
 * @returns {*} object itself if found, otherwise return -1
 */
var getItemWithIDFromArray = function(ID, array){
    "use strict";
    for( let aObject of array){
        if (aObject.id == ID){
            return aObject;
        }
    }
    return -1;
};

/**
 * remove an item with the id attribute ID from the array
 * @param ID: the ID attribute of the object
 * @param array: the array
 * @returns {number}: -1 if there is nothing to remove, 1 if can remove
 */
var removeItemWithIDFromArray = function(ID,array){
    //TO FINISH
    return -1;
};

