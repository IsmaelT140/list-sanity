import React from "react"
import "./App.css"

function App() {
	function sortByStation(a, b) {
		const stationA = a.slice(-5).replace("_", "")
		const stationB = b.slice(-5).replace("_", "")
		if (stationA < stationB) return -1
		if (stationA > stationB) return 1
		return 0
	}

	function handleInputChange(event) {
		const inputData = event.target.value
		const shipmentItemQuantities = {}
		let shipmentReport = ""
		let reportSummary = ""
		let shipmentArray = []
		let toteArray = []

		const regex = /(?=\s\d{5,}\s)/

		const toteStationRegex = /(?=ts[A-Za-z0-9]*\s*cvM01_IND_\d{2}_\d{2})/

		if (typeof inputData !== "string" || inputData.trim() === "") {
			document.querySelector(".dataOutput").value =
				"Please enter valid data in the input field to generate a report."
			return null
		}

		let lineArray =
			inputData.split(regex).length > 1
				? inputData.split(regex)
				: inputData.split(toteStationRegex).length > 1
					? inputData.split(toteStationRegex)
					: null

		if (!lineArray) {
			document.querySelector(".dataOutput").value =
				"Unable to process the input data. Please ensure it is in the correct format and try again."
			return null
		}

		lineArray
			.map((line) => line.trim().split(/[\n\t]+/))
			.forEach((lineArray) => {
				if (
					lineArray.length === 2 &&
					lineArray[0].startsWith("ts") &&
					lineArray[1].startsWith("cvM01_IND_")
				) {
					toteArray.push(`${lineArray[0]}${lineArray[1].slice(-6)}`)
				}

				if (
					lineArray.length > 2 &&
					typeof Number(lineArray[0]) === "number" &&
					typeof Number(lineArray[lineArray.length - 3]) === "number"
				) {
					const shipmentId = lineArray[0]
					const itemQuantity = Number(lineArray[lineArray.length - 3])

					shipmentItemQuantities[shipmentId] ??= 0
					shipmentItemQuantities["total"] ??= 0

					shipmentItemQuantities[shipmentId] += itemQuantity
					shipmentItemQuantities["total"] += itemQuantity
				}
			})

		if (Object.keys(shipmentItemQuantities).length !== 0) {
			reportSummary = `${shipmentItemQuantities["total"]} items, ${Object.keys(shipmentItemQuantities).length - 1} orders`

			for (const shipmentId in shipmentItemQuantities) {
				const itemQuantity = shipmentItemQuantities[shipmentId]
				if (shipmentId !== "total") {
					shipmentArray.push(
						`${shipmentId}, ${itemQuantity} item${itemQuantity > 1 ? "s" : ""}, `,
					)
				}
			}
		}

		shipmentArray = [...new Set(shipmentArray)]
		toteArray = [...new Set(toteArray)]

		shipmentArray.sort(sortByStation)
		toteArray.sort(sortByStation)

		const bothArraysEmpty = !shipmentArray.length && !toteArray.length
		const shipmentArrayValid = shipmentArray && shipmentArray.length > 0
		const toteArrayValid = toteArray && toteArray.length > 0

		shipmentReport = bothArraysEmpty
			? "No valid data processed. Please check your input and try again."
			: shipmentArrayValid
				? reportSummary + "\n" + shipmentArray.join("\n")
				: toteArrayValid
					? toteArray.join("\n")
					: null

		document.getElementById("dataOutput").value = shipmentReport
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
					<label htmlFor="dataOutput">Processed Data:</label>
					<textarea
						id="dataOutput"
						className="dataOutput"
						placeholder="Generated data will appear here..."
						readOnly
					></textarea>
				</div>
			</div>
		</div>
	)
}

export default App
