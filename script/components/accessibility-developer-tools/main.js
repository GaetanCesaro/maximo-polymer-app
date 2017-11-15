/*
 * IBM Confidential
 *
 * OCO Source Materials
 *
 * 5724-U18
 *
 * Copyright IBM Corp. 2017
 *
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has
 * been deposited with the U.S. Copyright Office.
 */
// This exposes the ./dist Javascript file for node libraries.
// It also unwraps the main axs package so Audit and other objects are exposed
// directly in the node library

var library = require('./dist/js/axs_testing'); // eslint-disable-line no-undef

module.exports = library.axs; // eslint-disable-line no-undef
