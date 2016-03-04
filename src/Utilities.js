/**
 * Created by khainguyen on 3/4/2016.
 */


/**
 * Return the object with the ID in the array.
 * @param ID: the ID of the object we are looking for
 * @param array: the array which holds the object
 * @returns {*} object itself if found, otherwise return -1
 */
var getItemFromArray = function(ID, array){
    for( let aObject of array){
        if (aObject.id == ID){
            return aObject;
            break;
        }
    }
    return -1;
}