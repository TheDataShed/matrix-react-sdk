/*
Copyright 2019 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*
 * Holds the current Platform object used by the code to do anything
 * specific to the platform we're running on (eg. web, electron)
 * Platforms are provided by the app layer.
 * This allows the app layer to set a Platform without necessarily
 * having to have a MatrixChat object
 */

import PlatformPeg from "./PlatformPeg";
import EventIndex from "./EventIndexing";
import MatrixClientPeg from "./MatrixClientPeg";

class EventIndexPeg {
    constructor() {
        this.index = null;
    }

    /**
     * Get the current event index.
     *
     * @return {EventIndex} The current event index.
     */
    get() {
        return this.index;
    }

    /** Create a new EventIndex and initialize it if the platform supports it.
     *
     * @return {Promise<bool>} A promise that will resolve to true if an
     * EventIndex was successfully initialized, false otherwise.
     */
    async init() {
        const indexManager = PlatformPeg.get().getEventIndexingManager();
        if (indexManager === null) return false;

        if (await indexManager.supportsEventIndexing() !== true) {
            console.log("EventIndex: Platform doesn't support event indexing,",
                        "not initializing.");
            return false;
        }

        const index = new EventIndex();
        const userId = MatrixClientPeg.get().getUserId();

        try {
            await index.init(userId);
        } catch (e) {
            console.log("EventIndex: Error initializing the event index", e);
        }

        console.log("EventIndex: Successfully initialized the event index");

        this.index = index;

        return true;
    }

    /**
     * Stop our event indexer.
     */
    stop() {
        if (this.index === null) return;
        this.index.stop();
        this.index = null;
    }

    /**
     * Delete our event indexer.
     *
     * After a call to this the init() method will need to be called again.
     *
     * @return {Promise} A promise that will resolve once the event index is
     * deleted.
     */
    async deleteEventIndex() {
        if (this.index === null) return;
        this.index.deleteEventIndex();
        this.index = null;
    }
}

if (!global.mxEventIndexPeg) {
    global.mxEventIndexPeg = new EventIndexPeg();
}
module.exports = global.mxEventIndexPeg;
