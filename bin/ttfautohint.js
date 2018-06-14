#!/usr/bin/env node
((i,e)=>{"use strict";var t=e("child_process"),r=e("path");t.spawn(r.join(__dirname,"ttfautohint".concat("win32"===i.platform?".exe":"")),i.argv.slice(2),{stdio:"inherit",windowsHide:!0})})(process,require);
