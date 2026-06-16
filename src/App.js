import React from "react"
import "./App.css"

const emptyInputMessage =
	"Please enter valid data in the input field to generate a report."
const invalidDataMessage =
	"Unable to process the input data. Please ensure it is in the correct format and try again."

function App() {
	function sortByStation(a, b) {
		const stationA = a.slice(-5).replace("_", "")
		const stationB = b.slice(-5).replace("_", "")
		if (stationA < stationB) return -1
		if (stationA > stationB) return 1
		return 0
	}

	async function copyToClipboard() {
		const copyValue = document
			.getElementById("dataOutput")
			.innerText.replace(/\n/g, "\r\n")
		try {
			await navigator.clipboard.writeText(copyValue)
			document.getElementById("copyButton").innerText = "Copied!"
			setTimeout(() => {
				document.getElementById("copyButton").innerText = "Copy Data"
			}, 2000)
		} catch (err) {
			console.error("Failed to copy data: ", err)
		}
	}

	function handleInputChange(event) {
		const inputData = event.target.value
		const shipmentItemQuantities = {}
		let shipmentReport = ""
		let reportSummary = ""
		let shipmentArray = []

		const regex = /(?<![\s\d])(?=\s+\d{5,}\s+)/

		const toteStationRegex = /ts[A-Za-z0-9]+\s+cvM01_IND_\d{2}_\d{2}/g

		const reinductToteRegex = /tsRNDT\d\d/g
		const pslvToteRegex = /tsAFE\dpslv\d/g

		if (typeof inputData !== "string" || inputData.trim() === "") {
			document.querySelector("#dataOutput").innerHTML = emptyInputMessage
			return null
		}

		let toteArray = [...inputData.matchAll(toteStationRegex)].map((arr) => {
			const [tote, station] = arr[0].split(/[\n\t]+/)
			return `${tote}_${station.slice(-5)}`
		})

		let reinductToteArray = [...inputData.matchAll(reinductToteRegex)]
			.map((arr) => arr[0])
			.sort()
		let pslvToteArray = [...inputData.matchAll(pslvToteRegex)]
			.map((arr) => arr[0])
			.sort()

		toteArray = toteArray.sort(sortByStation)

		toteArray = [
			...new Set([...pslvToteArray, ...reinductToteArray, ...toteArray]),
		]

		let lineArray =
			inputData.split(regex).length > 1
				? inputData
						.split(regex)
						.map((line) => line.trim().split(/[\n\t]+/))
				: null

		const bothArraysEmpty = !lineArray?.length && !toteArray?.length
		const lineArrayValid = lineArray && lineArray?.length > 0
		const toteArrayValid = toteArray && toteArray?.length > 0

		if (!lineArrayValid && toteArrayValid) {
			document.getElementById("dataOutput").innerHTML =
				toteArray.join("<br/>")
			return null
		}

		if (bothArraysEmpty) {
			document.querySelector("#dataOutput").innerHTML = invalidDataMessage
			return null
		}

		lineArray
			.filter(
				(lineArray) =>
					lineArray.length > 2 &&
					typeof Number(lineArray[0]) === "number" &&
					typeof Number(lineArray[lineArray.length - 3]) === "number",
			)
			.forEach((lineArray) => {
				const shipmentId = lineArray[0]
				const itemQuantity = Number(lineArray[lineArray.length - 3])

				shipmentItemQuantities[shipmentId] ??= 0
				shipmentItemQuantities["total"] ??= 0

				shipmentItemQuantities[shipmentId] += itemQuantity
				shipmentItemQuantities["total"] += itemQuantity
			})

		if (Object.keys(shipmentItemQuantities).length !== 0) {
			reportSummary = `${shipmentItemQuantities["total"]} items, ${Object.keys(shipmentItemQuantities).length - 1} orders`

			for (const shipmentId in shipmentItemQuantities) {
				const itemQuantity = shipmentItemQuantities[shipmentId]
				if (shipmentId !== "total") {
					shipmentArray.push(
						`<span><a href="https://rodeo-iad.amazon.com/DEN3/Search?searchKey=${shipmentId}">${shipmentId}</a>, ${itemQuantity} item${itemQuantity > 1 ? "s" : ""}, </span>`,
					)
				}
			}
		}

		shipmentArray = [...new Set(shipmentArray)]

		const shipmentArrayValid = shipmentArray && shipmentArray?.length > 0

		shipmentReport = shipmentArrayValid
			? reportSummary + "\n" + shipmentArray.join("\n")
			: invalidDataMessage

		document.getElementById("dataOutput").innerHTML = shipmentReport
	}

	return (
		<div className="App">
			<h1>ListSanity</h1>
			<p>Paste your data in the input field below:</p>

			<div className="containerDiv">
				<div className="inputDiv">
					<label htmlFor="dataInput">Input Data:</label>
					<textarea
						id="dataInput"
						className="dataInput"
						placeholder="Paste data here..."
						onChange={handleInputChange}
					></textarea>
				</div>
				<div className="outputDiv">
					<div id="dataOutput" className="dataOutput">
						<h3>Generated data will appear here...</h3>
					</div>
					<button id="copyButton" onClick={copyToClipboard}>
						Copy Data
					</button>
				</div>
			</div>
		</div>
	)
}

export default App
