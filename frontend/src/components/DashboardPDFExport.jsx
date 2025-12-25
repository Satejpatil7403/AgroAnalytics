import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const DashboardPDFExport = ({ dashboardRef, stats, villageStats }) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);

        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Title Page
            doc.setFontSize(24);
            doc.setTextColor(34, 197, 94); // Green color
            doc.text('AgroAnalytics Dashboard Report', pageWidth / 2, 30, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

            // Key Metrics
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text('Key Metrics', 14, 60);

            doc.setFontSize(11);
            const metrics = [
                ['Metric', 'Value'],
                ['Total Farmers', stats.total_farmers.toString()],
                ['Total Area (Acres)', stats.total_area.toString()],
                ['Average Yield (kg/acre)', stats.average_yield.toString()],
                ['Villages Covered', stats.total_villages.toString()]
            ];

            doc.autoTable({
                head: [metrics[0]],
                body: metrics.slice(1),
                startY: 65,
                theme: 'grid',
                headStyles: { fillColor: [34, 197, 94] },
                margin: { left: 14, right: 14 }
            });

            // Capture all visualizations
            if (dashboardRef && dashboardRef.current) {
                doc.addPage();
                doc.setFontSize(16);
                doc.setTextColor(0);
                doc.text('Data Visualizations', 14, 20);

                try {
                    // Scroll to top to ensure complete capture context
                    window.scrollTo(0, 0);

                    // Wait for animations/renders to settle
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const element = dashboardRef.current;
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        allowTaint: true,
                        scrollX: 0,
                        scrollY: -window.scrollY,
                        windowWidth: document.documentElement.offsetWidth,
                        windowHeight: element.scrollHeight + 100, // Ensure full height capture
                        height: element.scrollHeight + 100
                    });

                    const imgData = canvas.toDataURL('image/png');
                    const imgProps = doc.getImageProperties(imgData);
                    const pdfWidth = pageWidth - 28;
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    // Add images across multiple pages if needed
                    let heightLeft = pdfHeight;
                    let position = 30;

                    doc.addImage(imgData, 'PNG', 14, position, pdfWidth, pdfHeight);
                    heightLeft -= (pageHeight - position);

                    while (heightLeft > 0) {
                        position = heightLeft - pdfHeight;
                        doc.addPage();
                        doc.addImage(imgData, 'PNG', 14, position, pdfWidth, pdfHeight);
                        heightLeft -= pageHeight;
                    }
                } catch (error) {
                    console.error('Error capturing charts:', error);
                }
            }

            // Village Statistics Table
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text('Village Statistics', 14, 20);

            const villageTableData = villageStats.map(village => [
                village.village_name,
                village.farmer_count.toString(),
                village.total_area.toString(),
                `${((village.total_area / stats.total_area) * 100).toFixed(1)}%`
            ]);

            doc.autoTable({
                head: [['Village Name', 'Farmer Count', 'Total Area (Acres)', 'Contribution']],
                body: villageTableData,
                startY: 25,
                theme: 'grid',
                headStyles: { fillColor: [34, 197, 94] },
                styles: { fontSize: 9 }
            });

            doc.save('AgroAnalytics-Dashboard-Report.pdf');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to generate PDF report. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            className="btn btn-primary"
            disabled={exporting || !stats}
        >
            {exporting ? 'Generating PDF...' : '📄 Download Dashboard PDF'}
        </button>
    );
};

export default DashboardPDFExport;
