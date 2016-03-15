/**
 * Created by khainguyen on 3/4/2016.
 */

/**
 * Return the object with the ID in the array.
 * @param ID: the ID of the object we are looking for
 * @param array: the array which holds the object
 * @returns {*} object itself if found, otherwise return -1
 */
"use strict";
module.exports.getItemWithIDFromArray = function(ID, dictionary){
    if(dictionary[ID] === undefined) return -1;
    else{
        if(dictionary[ID].id == ID) return dictionary[ID];
    }
};

/**
 * remove an item with the id attribute ID from the array
 * @param ID: the ID attribute of the object
 * @param dictionary: the array
 * @returns {number}: -1 if there is nothing to remove, 1 if can remove
 */

module.exports.removeItemWithIDFromArray = function(ID,dictionary){
   if(dictionary[ID] === undefined) return -1;
    else{
       if(dictionary[ID].id == ID) delete dictionary[ID];
   }
};