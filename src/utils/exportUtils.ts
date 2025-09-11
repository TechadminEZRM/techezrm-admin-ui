// Export utilities for PDF and Excel formats

export interface ExportProduct {
  _id: string;
  uniqueId?: string;
  seq?: number;
  name: string;
  description?: string;
  price: number;
  category?: {
    _id: string;
    name: string;
  };
  inStock: boolean;
  bannerImage?: string;
  images?: string[];
  status?: string;
  moq?: number;
  unit?: string;
  tags?: string[];
  appearance?: string;
  dietaryAttributes?: Array<{
    title: string;
    logo: string;
    certificateLink: string;
  }>;
  applications?: string[];
  functions?: string[];
  countryOfOrigin?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Check if dependencies are available
const checkDependencies = () => {
  const missingDeps: string[] = [];

  try {
    require.resolve('jspdf');
  } catch {
    missingDeps.push('jspdf');
  }

  try {
    require.resolve('jspdf-autotable');
  } catch {
    missingDeps.push('jspdf-autotable');
  }

  try {
    require.resolve('xlsx');
  } catch {
    missingDeps.push('xlsx');
  }

  return missingDeps;
};

// PDF Export using jsPDF
export const exportToPDF = async (
  products: ExportProduct[],
  filename: string = 'products'
) => {
  // Check dependencies first
  const missingDeps = checkDependencies();
  const pdfDeps = ['jspdf', 'jspdf-autotable'];
  const missingPdfDeps = missingDeps.filter((dep) => pdfDeps.includes(dep));

  if (missingPdfDeps.length > 0) {
    throw new Error(
      `PDF export requires these packages: ${missingPdfDeps.join(', ')}. Please install them using: npm install ${missingPdfDeps.join(' ')}`
    );
  }

  try {
    // Dynamic import to avoid SSR issues
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;

    // Import jspdf-autotable with error handling
    let autoTable;
    try {
      const autoTableModule = await import('jspdf-autotable');
      autoTable = autoTableModule.default;
    } catch (autoTableError) {
      console.warn(
        'jspdf-autotable import failed, falling back to basic PDF export:',
        autoTableError
      );
      // Fallback: create a comprehensive PDF without tables
      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Products Export (Basic Format)', 14, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Add comprehensive product list
      let yPosition = 50;
      products.forEach((product, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Product header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${product.name}`, 14, yPosition);
        yPosition += 8;

        // Product details
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const details = [
          `ID: ${product._id}`,
          `Price: $${product.price || 0}`,
          `Category: ${product.category?.name || 'N/A'}`,
          `Status: ${product.status || 'N/A'}`,
          `In Stock: ${product.inStock ? 'Yes' : 'No'}`,
          `MOQ: ${product.moq || 'N/A'}`,
          `Unit: ${product.unit || 'N/A'}`,
          `Description: ${product.description || 'N/A'}`,
          `Tags: ${product.tags?.join(', ') || 'N/A'}`,
          `Applications: ${product.applications?.join(', ') || 'N/A'}`,
          `Functions: ${product.functions?.join(', ') || 'N/A'}`,
          `Country of Origin: ${product.countryOfOrigin?.join(', ') || 'N/A'}`,
          `Banner Image: ${product.bannerImage || 'N/A'}`,
          `Images: ${product.images?.join(', ') || 'N/A'}`,
          `Created: ${product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}`,
        ];

        details.forEach((detail) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(detail, 20, yPosition);
          yPosition += 5;
        });

        yPosition += 10; // Extra space between products
      });

      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation for better table view

    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Products Export', 14, 20);

    // Add export date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Prepare comprehensive table data (same as Excel)
    const tableData = products.map((product) => [
      product._id || 'N/A',
      product.uniqueId || '',
      product.seq || '',
      product.name || 'N/A',
      product.description || '',
      `$${product.price || 0}`,
      product.category?._id || '',
      product.category?.name || '',
      product.inStock ? 'Yes' : 'No',
      product.status || '',
      product.moq || '',
      product.unit || '',
      product.tags?.join(', ') || '',
      product.appearance || '',
      product.applications?.join(', ') || '',
      product.functions?.join(', ') || '',
      product.countryOfOrigin?.join(', ') || '',
      product.bannerImage || '',
      product.images?.join(', ') || '',
      product.dietaryAttributes
        ?.map((attr) => `${attr.title} (${attr.logo})`)
        .join('; ') || '',
      product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '',
      product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : '',
    ]);

    // Define comprehensive table columns (same as Excel)
    const columns = [
      'Product ID',
      'Unique ID',
      'Sequence',
      'Product Name',
      'Description',
      'Price',
      'Category ID',
      'Category Name',
      'In Stock',
      'Status',
      'MOQ',
      'Unit',
      'Tags',
      'Appearance',
      'Applications',
      'Functions',
      'Country of Origin',
      'Banner Image',
      'Images',
      'Dietary Attributes',
      'Created Date',
      'Updated Date',
    ];

    // Add comprehensive table with better formatting
    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 6, // Smaller font for more columns
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [25, 118, 210], // Blue header
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250], // Light gray for alternate rows
      },
      columnStyles: {
        // Set specific column widths for better layout
        0: { cellWidth: 15 }, // Product ID
        1: { cellWidth: 12 }, // Unique ID
        2: { cellWidth: 8 }, // Sequence
        3: { cellWidth: 20 }, // Product Name
        4: { cellWidth: 25 }, // Description
        5: { cellWidth: 10 }, // Price
        6: { cellWidth: 15 }, // Category ID
        7: { cellWidth: 18 }, // Category Name
        8: { cellWidth: 8 }, // In Stock
        9: { cellWidth: 10 }, // Status
        10: { cellWidth: 8 }, // MOQ
        11: { cellWidth: 8 }, // Unit
        12: { cellWidth: 15 }, // Tags
        13: { cellWidth: 15 }, // Appearance
        14: { cellWidth: 20 }, // Applications
        15: { cellWidth: 20 }, // Functions
        16: { cellWidth: 18 }, // Country of Origin
        17: { cellWidth: 25 }, // Banner Image
        18: { cellWidth: 30 }, // Images
        19: { cellWidth: 25 }, // Dietary Attributes
        20: { cellWidth: 12 }, // Created Date
        21: { cellWidth: 12 }, // Updated Date
      },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto',
      showHead: 'everyPage',
    });

    // Add summary section (similar to Excel export)
    if (products.length > 0) {
      let currentY = (doc as any).lastAutoTable.finalY + 20;

      // Check if we need a new page for summary
      if (currentY > 200) {
        doc.addPage();
        currentY = 20;
      }

      // Add summary title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Export Summary', 14, currentY);
      currentY += 15;

      // Add summary data
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const summaryData = [
        { label: 'Total Products', value: products.length.toString() },
        {
          label: 'Active Products',
          value: products
            .filter((p) => p.status === 'active')
            .length.toString(),
        },
        {
          label: 'Inactive Products',
          value: products
            .filter((p) => p.status === 'inactive')
            .length.toString(),
        },
        {
          label: 'In Stock Products',
          value: products.filter((p) => p.inStock).length.toString(),
        },
        {
          label: 'Out of Stock Products',
          value: products.filter((p) => !p.inStock).length.toString(),
        },
        {
          label: 'Average Price',
          value:
            products.length > 0
              ? `$${(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length).toFixed(2)}`
              : '$0.00',
        },
        { label: 'Export Date', value: new Date().toLocaleDateString() },
      ];

      summaryData.forEach((item) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.label}:`, 14, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(item.value, 80, currentY);
        currentY += 8;
      });
    }

    // Save the PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error: any) {
    console.error('Error exporting to PDF:', error);
    if (error.message?.includes('Cannot find module')) {
      throw new Error(
        'PDF export library not installed. Please install jspdf and jspdf-autotable packages.'
      );
    }
    throw new Error('Failed to export PDF. Please try again.');
  }
};

// Excel Export using xlsx
export const exportToExcel = async (
  products: ExportProduct[],
  filename: string = 'products'
) => {
  // Check dependencies first
  const missingDeps = checkDependencies();

  if (missingDeps.includes('xlsx')) {
    throw new Error(
      'Excel export requires the xlsx package. Please install it using: npm install xlsx'
    );
  }

  try {
    // Dynamic import to avoid SSR issues
    const XLSX = await import('xlsx');
    const { utils } = XLSX;

    // Prepare data for Excel
    const excelData = products.map((product) => ({
      'Product ID': product._id,
      'Unique ID': product.uniqueId || '',
      Sequence: product.seq || '',
      'Product Name': product.name,
      Description: product.description || '',
      Price: product.price || 0,
      'Category ID': product.category?._id || '',
      'Category Name': product.category?.name || '',
      'In Stock': product.inStock ? 'Yes' : 'No',
      Status: product.status || '',
      MOQ: product.moq || '',
      Unit: product.unit || '',
      Tags: product.tags?.join(', ') || '',
      Appearance: product.appearance || '',
      Applications: product.applications?.join(', ') || '',
      Functions: product.functions?.join(', ') || '',
      'Country of Origin': product.countryOfOrigin?.join(', ') || '',
      'Banner Image': product.bannerImage || '',
      Images: product.images?.join(', ') || '',
      'Dietary Attributes':
        product.dietaryAttributes
          ?.map((attr) => `${attr.title} (${attr.logo})`)
          .join('; ') || '',
      'Created Date': product.createdAt
        ? new Date(product.createdAt).toLocaleDateString()
        : '',
      'Updated Date': product.updatedAt
        ? new Date(product.updatedAt).toLocaleDateString()
        : '',
    }));

    // Create workbook and worksheet
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Product ID
      { wch: 15 }, // Unique ID
      { wch: 10 }, // Sequence
      { wch: 25 }, // Product Name
      { wch: 30 }, // Description
      { wch: 10 }, // Price
      { wch: 15 }, // Category ID
      { wch: 20 }, // Category Name
      { wch: 10 }, // In Stock
      { wch: 12 }, // Status
      { wch: 10 }, // MOQ
      { wch: 10 }, // Unit
      { wch: 20 }, // Tags
      { wch: 20 }, // Appearance
      { wch: 25 }, // Applications
      { wch: 25 }, // Functions
      { wch: 20 }, // Country of Origin
      { wch: 30 }, // Banner Image
      { wch: 50 }, // Images
      { wch: 40 }, // Dietary Attributes
      { wch: 15 }, // Created Date
      { wch: 15 }, // Updated Date
    ];

    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    utils.book_append_sheet(workbook, worksheet, 'Products');

    // Add summary sheet
    const summaryData = [
      { Metric: 'Total Products', Value: products.length },
      {
        Metric: 'Active Products',
        Value: products.filter((p) => p.status === 'active').length,
      },
      {
        Metric: 'Inactive Products',
        Value: products.filter((p) => p.status === 'inactive').length,
      },
      {
        Metric: 'In Stock Products',
        Value: products.filter((p) => p.inStock).length,
      },
      {
        Metric: 'Out of Stock Products',
        Value: products.filter((p) => !p.inStock).length,
      },
      {
        Metric: 'Average Price',
        Value:
          products.length > 0
            ? (
                products.reduce((sum, p) => sum + (p.price || 0), 0) /
                products.length
              ).toFixed(2)
            : 0,
      },
      { Metric: 'Export Date', Value: new Date().toLocaleDateString() },
    ];

    const summaryWorksheet = utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
    utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Save the Excel file
    XLSX.writeFile(
      workbook,
      `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  } catch (error: any) {
    console.error('Error exporting to Excel:', error);
    if (error.message?.includes('Cannot find module')) {
      throw new Error(
        'Excel export library not installed. Please install xlsx package.'
      );
    }
    throw new Error('Failed to export Excel. Please try again.');
  }
};

// CSV Export (no external dependencies required)
export const exportToCSV = async (
  products: ExportProduct[],
  filename: string = 'products'
) => {
  try {
    // Create CSV headers
    const headers = [
      'Product ID',
      'Unique ID',
      'Sequence',
      'Product Name',
      'Description',
      'Price',
      'Category ID',
      'Category Name',
      'In Stock',
      'Status',
      'MOQ',
      'Unit',
      'Tags',
      'Appearance',
      'Applications',
      'Functions',
      'Country of Origin',
      'Banner Image',
      'Images',
      'Dietary Attributes',
      'Created Date',
      'Updated Date',
    ];

    // Create CSV rows
    const rows = products.map((product) => [
      product._id,
      product.uniqueId || '',
      product.seq || '',
      product.name,
      product.description || '',
      product.price || 0,
      product.category?._id || '',
      product.category?.name || '',
      product.inStock ? 'Yes' : 'No',
      product.status || '',
      product.moq || '',
      product.unit || '',
      product.tags?.join(', ') || '',
      product.appearance || '',
      product.applications?.join(', ') || '',
      product.functions?.join(', ') || '',
      product.countryOfOrigin?.join(', ') || '',
      product.bannerImage || '',
      product.images?.join(', ') || '',
      product.dietaryAttributes
        ?.map((attr) => `${attr.title} (${attr.logo})`)
        .join('; ') || '',
      product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '',
      product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : '',
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error: any) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export CSV. Please try again.');
  }
};

// Check which export formats are available
export const getAvailableExportFormats = () => {
  const missingDeps = checkDependencies();

  return {
    csv: true, // CSV is always available
    pdf:
      !missingDeps.includes('jspdf') &&
      !missingDeps.includes('jspdf-autotable'),
    excel: !missingDeps.includes('xlsx'),
  };
};

// Helper function to get all products for export
export const getAllProductsForExport = async (productService: any) => {
  try {
    // Fetch all products without pagination
    const response = await productService.getProducts({
      page: 1,
      limit: 10000, // Large number to get all products
    });

    return response.products || [];
  } catch (error) {
    console.error('Error fetching products for export:', error);
    throw new Error('Failed to fetch products for export');
  }
};
