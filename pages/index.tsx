import { useState, useEffect } from "react";

export default function Home() {
  const [destFile, setDestFile] = useState<File>();
  const [destHeaders, setDestHeaders] = useState<string[]>([]);
  const [destAssignments, setDestAssignments] = useState<number[]>([]);
  const [destFillValues, setDestFillValues] = useState<string[]>([]);

  const [srcFile, setSrcFile] = useState<File>();
  const [srcHeaders, setSrcHeaders] = useState<string[]>([]);
  const [srcData, setSrcData] = useState<string[][]>([]);

  useEffect(() => {
    if (destFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const [headersRow, ...dataRows] = String(e.target.result).split("\n");
        const headers = headersRow.split(",");
        setDestHeaders(headers);
        setDestAssignments(headers.map(() => -1));
        setDestFillValues(headers.map(() => ""));
      };
      reader.readAsText(destFile);
    }
  }, [destFile]);

  useEffect(() => {
    if (srcFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const [headersRow, ...dataRows] = String(e.target.result).split("\n");
        const headers = headersRow.split(",");
        const data = dataRows.map((dataRow) => dataRow.split(","));
        setSrcHeaders(headers);
        setSrcData(data);
      };
      reader.readAsText(srcFile);
    }
  }, [srcFile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const resultHeaders = destHeaders;
    const resultData = srcData.map((data) => {
      const transformedData = destAssignments.map((srcDataIndex, dataIndex) => {
        return srcDataIndex !== -1
          ? data[srcDataIndex]
          : destFillValues[dataIndex];
      });
      return transformedData;
    });

    const csvFile = [
      resultHeaders.join(","),
      ...resultData.map((data) => data.join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "result.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <h1>CSV.XYZ</h1>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <h2>CSV Files</h2>
          <label htmlFor="destination-file">Destination Headers: </label>
          <input
            id="destination-file"
            name="destination-file"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              setDestFile(e.target.files[0]);
            }}
            required
          />

          <label htmlFor="source-file">Source File: </label>
          <input
            id="source-file"
            name="source-file"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              setSrcFile(e.target.files[0]);
            }}
            required
          />
        </fieldset>
        <fieldset>
          <h2>Header Assignment</h2>
          {destFile && srcFile ? (
            destHeaders.map((header, i) => (
              <p key={i}>
                <b>{header}</b> should map to{" "}
                <select
                  name={`column-reassign-index-header-${header}`}
                  required
                  value={destAssignments[i]}
                  onChange={(e) => {
                    const result = Array.from(destAssignments);
                    result[i] = parseInt(e.target.value);
                    setDestAssignments(result);
                  }}
                >
                  <option value={-1} label="Unassigned"></option>
                  {srcHeaders.map((_header, j) => {
                    return <option key={j} value={j} label={_header} />;
                  })}
                </select>{" "}
                or fill with{" "}
                <input
                  name={`column-fill-value=${header}`}
                  value={destFillValues[i]}
                  disabled={destAssignments[i] !== -1}
                  placeholder="Empty"
                  onChange={(e) => {
                    const result = Array.from(destFillValues);
                    result[i] = e.target.value;
                    setDestFillValues(result);
                  }}
                />
              </p>
            ))
          ) : (
            <p>Please provide destination headers and source file csv's...</p>
          )}
        </fieldset>

        <button type="submit">Convert</button>
      </form>
    </div>
  );
}
