import React from 'react';

const CSVExport = ({ data, filename = 'farmer_data.csv' }) => {
    const handleDownload = () => {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        // Define headers
        const headers = [
            'ID',
            'Farmer Name',
            'Village Name',
            'Crop Type',
            'Area (Acres)',
            'Yield (kg)',
            'Latitude',
            'Longitude'
        ];

        // Map data to CSV rows
        const rows = data.map(item => [
            item.id,
            `"${item.farmer_name}"`, // Quote strings to handle commas
            `"${item.village_name}"`,
            `"${item.crop_type}"`,
            item.area_acres,
            item.yield_kg,
            item.latitude,
            item.longitude
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="btn btn-secondary"
            disabled={!data || data.length === 0}
            title="Download filtered data as CSV"
        >
            📥 Download CSV
        </button>
    );
};

export default CSVExport;
