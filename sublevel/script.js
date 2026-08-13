const dropZone =
    document.getElementById("dropZone")

const fileInput =
    document.getElementById("fileInput")

const results =
    document.getElementById("results")

const levelNameElement =
    document.getElementById("levelName")

const fileNameElement =
    document.getElementById("fileName")

const countElement =
    document.getElementById("count")

const sublevelsElement =
    document.getElementById("sublevels")

const statusElement =
    document.getElementById("status")

const copyAllButton =
    document.getElementById("copyAll")



/*
    grab vr community reference

    community:<id>:<timestamp>:<version>
*/

const SUBLEVEL_REGEX =
    /community:[a-zA-Z0-9_-]+:\d+:\d+/g



/*
    decode the binary .level file

    latin1-style decoding keeps the original
    byte values so embedded ascii strings survive
*/

function decodeBinary(buffer) {

    const bytes =
        new Uint8Array(buffer)

    let result = ""

    const chunkSize = 0x8000

    for (
        let offset = 0;
        offset < bytes.length;
        offset += chunkSize
    ) {

        const chunk =
            bytes.subarray(
                offset,
                Math.min(
                    offset + chunkSize,
                    bytes.length
                )
            )

        result +=
            String.fromCharCode(...chunk)
    }

    return result
}



/*
    find level name metadata
*/

function findLevelName(text) {

    const patterns = [

        /(?:levelName|level_name|levelname|displayName|display_name|title)\s*[:=]\s*["']([^"'\0]{2,120})["']/i,

        /(?:levelName|level_name|levelname|displayName|display_name|title)\0+([^\0]{2,120})/i,

        /(?:levelName|level_name|levelname|displayName|display_name|title)[^\x20-\x7e]{0,10}([A-Za-z0-9][A-Za-z0-9 "'!.,:_()\-]{2,100})/i

    ]


    for (const pattern of patterns) {

        const match =
            text.match(pattern)

        if (!match) {
            continue
        }

        const name =
            match[1]
                .replace(/\0/g, "")
                .trim()

        if (name.length >= 2) {
            return name
        }
    }

    return "unknown level"
}



/*
    find a possible sublevel name near
    the community reference
*/

function findNearbyName(
    text,
    index,
    reference
) {

    const radius = 500

    const start =
        Math.max(
            0,
            index - radius
        )

    const end =
        Math.min(
            text.length,
            index +
            reference.length +
            radius
        )

    const nearby =
        text.slice(start, end)


    const strings =
        nearby.match(
            /[A-Za-z][A-Za-z0-9 "'!.,:_()\-]{3,100}/g
        ) || []


    for (const string of strings) {

        const clean =
            string
                .replace(/\0/g, "")
                .trim()


        if (!clean) {
            continue
        }


        if (clean.includes("community:")) {
            continue
        }


        if (
            clean.length < 4 ||
            clean.length > 100
        ) {
            continue
        }


        if (
            /^(community|unity|system|transform|gameobject|shader|texture|guid|assembly|version)$/i
                .test(clean)
        ) {
            continue
        }


        if (
            !clean.includes("/") &&
            !clean.includes("\\")
        ) {
            return clean
        }
    }


    return "unknown sublevel"
}



/*
    extract unique community references
*/

function extractSublevels(text) {

    const matches =
        [...text.matchAll(SUBLEVEL_REGEX)]

    const seen =
        new Set()

    const sublevels =
        []


    for (const match of matches) {

        const reference =
            match[0]


        if (seen.has(reference)) {
            continue
        }


        seen.add(reference)


        sublevels.push({

            reference,

            name:
                findNearbyName(
                    text,
                    match.index,
                    reference
                )

        })
    }


    return sublevels
}



/*
    clipboard helper

    tries Clipboard API first

    if the browser blocks it, falls back
    to the old execCommand method

    this is what fixes the permissions-policy
    error you were getting
*/

async function copyText(text) {

    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(text)

            return true
        }

    } catch (error) {

        console.warn(
            "clipboard api unavailable, using fallback",
            error
        )

    }


    const textarea =
        document.createElement("textarea")

    textarea.value =
        text

    textarea.style.position =
        "fixed"

    textarea.style.left =
        "-9999px"

    textarea.style.top =
        "0"

    textarea.style.opacity =
        "0"

    document.body.appendChild(
        textarea
    )

    textarea.focus()
    textarea.select()

    textarea.setSelectionRange(
        0,
        textarea.value.length
    )


    let success = false

    try {

        success =
            document.execCommand("copy")

    } catch (error) {

        console.warn(
            "fallback clipboard failed",
            error
        )

        success = false
    }


    textarea.remove()

    return success
}



/*
    process uploaded file
*/

async function processFile(file) {

    results.style.display =
        "block"


    fileNameElement.textContent =
        file.name


    levelNameElement.textContent =
        "reading metadata..."


    sublevelsElement.innerHTML =
        ""


    statusElement.textContent =
        "scanning level..."


    statusElement.className =
        "status"


    try {

        const buffer =
            await file.arrayBuffer()


        const text =
            decodeBinary(buffer)


        const levelName =
            findLevelName(text)


        levelNameElement.textContent =
            levelName


        const sublevels =
            extractSublevels(text)


        renderSublevels(
            sublevels
        )

    } catch (error) {

        console.error(error)


        levelNameElement.textContent =
            "failed to read level"


        statusElement.textContent =
            "something went wrong while reading this file"


        statusElement.className =
            "status error"
    }
}



/*
    render sublevel results
*/

function renderSublevels(sublevels) {

    sublevelsElement.innerHTML =
        ""

    countElement.textContent =
        sublevels.length


    if (!sublevels.length) {

        sublevelsElement.innerHTML = `
            <div class="empty">
                no community sublevels found
            </div>
        `

        statusElement.textContent =
            "no embedded sublevel references were detected"

        return
    }


    sublevels.forEach(
        (sublevel, index) => {

            const row =
                document.createElement("div")

            row.className =
                "sublevel"


            const number =
                document.createElement("div")

            number.className =
                "number"

            number.textContent =
                String(index + 1)
                    .padStart(2, "0")


            const name =
                document.createElement("div")

            name.className =
                "sublevel-name"

            name.textContent =
                sublevel.name


            if (
                sublevel.name ===
                "unknown sublevel"
            ) {

                name.classList.add(
                    "unknown"
                )
            }


            const id =
                document.createElement("div")

            id.className =
                "sublevel-id"

            /*
                show community: on the page
            */

            id.textContent =
                sublevel.reference


            const copy =
                document.createElement("button")

            copy.className =
                "copy"

            copy.textContent =
                "copy"


            /*
                IMPORTANT

                displayed:

                community:29y5xtwiv6shb636vdb9c:1785305906:2

                copied:

                29y5xtwiv6shb636vdb9c:1785305906:2
            */

            copy.addEventListener(
                "click",
                async () => {

                    const copyValue =
                        sublevel.reference
                            .replace(
                                /^community:/,
                                ""
                            )


                    const success =
                        await copyText(
                            copyValue
                        )


                    copy.textContent =
                        success
                            ? "copied"
                            : "select"


                    setTimeout(() => {

                        copy.textContent =
                            "copy"

                    }, 1000)

                }
            )


            row.appendChild(number)
            row.appendChild(name)
            row.appendChild(id)
            row.appendChild(copy)


            sublevelsElement
                .appendChild(row)

        }
    )


    statusElement.textContent =
        `${sublevels.length} unique sublevel${sublevels.length === 1 ? "" : "s"} detected`
}



/*
    copy all

    community: is stripped from every
    copied reference
*/

copyAllButton.addEventListener(
    "click",
    async () => {

        const values =
            [...document.querySelectorAll(
                ".sublevel-id"
            )]
            .map(
                element =>
                    element.textContent
                        .replace(
                            /^community:/,
                            ""
                        )
            )


        if (!values.length) {
            return
        }


        const success =
            await copyText(
                values.join("\n")
            )


        copyAllButton.textContent =
            success
                ? "copied"
                : "select"


        setTimeout(() => {

            copyAllButton.textContent =
                "copy all"

        }, 1000)

    }
)



/*
    file picker
*/

fileInput.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files[0]

        if (file) {
            processFile(file)
        }

    }
)



/*
    drag and drop
*/

dropZone.addEventListener(
    "dragover",
    event => {

        event.preventDefault()

        dropZone.classList.add(
            "dragging"
        )

    }
)


dropZone.addEventListener(
    "dragleave",
    () => {

        dropZone.classList.remove(
            "dragging"
        )

    }
)


dropZone.addEventListener(
    "drop",
    event => {

        event.preventDefault()

        dropZone.classList.remove(
            "dragging"
        )


        const file =
            event.dataTransfer.files[0]


        if (!file) {
            return
        }


        if (
            !file.name
                .toLowerCase()
                .endsWith(".level")
        ) {

            results.style.display =
                "block"


            statusElement.textContent =
                "please choose a .level file"


            statusElement.className =
                "status error"

            return
        }


        processFile(file)

    }
)