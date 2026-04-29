import React from "react"
import "./App.css"

function App() {
	function handleInputChange(event) {
		const inputData = event.target.value
		const shipmentItemQuantities = {}
		let shipmentReport = ""
		let shipmentArray = []
		let toteArray = []

		if (typeof inputData !== "string" || inputData.trim() === "") {
			document.querySelector(".dataOutput").value =
				"Please enter valid data in the input field to generate a report."
			return null
		}

		inputData
			.split("\n")
			.map((line) => line.trim().split("\t"))
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
			shipmentArray.push(
				`${shipmentItemQuantities["total"]} items, ${Object.keys(shipmentItemQuantities).length - 1} orders`,
			)

			for (const shipmentId in shipmentItemQuantities) {
				const itemQuantity = shipmentItemQuantities[shipmentId]
				if (shipmentId !== "total") {
					shipmentArray.push(
						`${shipmentId}, ${itemQuantity} item${itemQuantity > 1 ? "s" : ""}, `,
					)
				}
			}
		}

		function sortByStation(a, b) {
			const stationA = a.slice(-5).replace("_", "")
			const stationB = b.slice(-5).replace("_", "")
			if (stationA < stationB) return -1
			if (stationA > stationB) return 1
			return 0
		}

		shipmentArray = [...new Set(shipmentArray)]
		toteArray = [...new Set(toteArray)]

		shipmentArray.sort(sortByStation)
		toteArray.sort(sortByStation)

		shipmentReport =
			shipmentArray.length === 0 && toteArray.length === 0
				? "No valid data processed. Please check your input and try again."
				: null

		shipmentReport =
			shipmentArray && shipmentArray.length > 0
				? shipmentArray.join("\n")
				: null

		shipmentReport ??= toteArray.join("\n")

		document.getElementById("dataOutput").value = shipmentReport
		document.getElementById("copyButton").disabled = false
	}

	return (
		<div className="App">
			<h1>ListSanity</h1>
			<p>Paste your data in the input field below:</p>

			<div className="containerDiv">
				<label htmlFor="dataInput">Input Data:</label>
				<textarea
					id="dataInput"
					className="dataInput"
					placeholder="Paste data here..."
					onChange={handleInputChange}
				></textarea>
				<label htmlFor="dataOutput">Processed Data:</label>
				<textarea
					id="dataOutput"
					className="dataOutput"
					placeholder="Generated data will appear here..."
					readOnly
				></textarea>
			</div>
		</div>
	)
}

export default App
