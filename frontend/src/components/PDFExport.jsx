import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const PDFExport = ({ farmers, chartsRef }) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);

        try {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(20);
            doc.setTextColor(40, 167, 69); // Green color
            doc.text('AgroAnalytics Report', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

            let yPos = 40;

            // Add charts if available
            if (chartsRef && chartsRef.current) {
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Data Visualizations', 14, yPos);
                yPos += 10;

                // Wait for animations/renders to settle
                window.scrollTo(0, 0);
                await new Promise(resolve => setTimeout(resolve, 1000));

                const chartElements = chartsRef.current.querySelectorAll('.chart-section');

                for (let i = 0; i < chartElements.length; i++) {
                    const element = chartElements[i];

                    const canvas = await html2canvas(element, {
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const imgProps = doc.getImageProperties(imgData);
                    const pdfWidth = doc.internal.pageSize.getWidth() - 28;
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    // Check if chart fits on current page
                    if (yPos + pdfHeight > doc.internal.pageSize.getHeight() - 20) {
                        doc.addPage();
                        yPos = 20; // Reset Y position for new page
                    }

                    doc.addImage(imgData, 'PNG', 14, yPos, pdfWidth, pdfHeight);
                    yPos += pdfHeight + 10;
                }
            }

            // Add Table
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Farmer Data Records', 14, yPos);

            const tableColumn = ["ID", "Name", "Village", "Crop", "Area (Acres)", "Yield (kg)"];
            const tableRows = [];

            farmers.forEach(farmer => {
                const farmerData = [
                    farmer.id,
                    farmer.farmer_name,
                    farmer.village_name,
                    farmer.crop_type,
                    farmer.area_acres,
                    farmer.yield_kg
                ];
                tableRows.push(farmerData);
            });

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: yPos + 5,
                theme: 'grid',
                headStyles: { fillColor: [34, 197, 94] }, // Green header
                styles: { fontSize: 8 }
            });

            doc.save('AgroAnalytics Report.pdf');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to generate PDF report');
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            className="btn btn-primary"
            disabled={exporting || farmers.length === 0}
        >
            {exporting ? 'Generating PDF...' : '📄 Export PDF Report'}
        </button>
    );
};

export default PDFExport;
