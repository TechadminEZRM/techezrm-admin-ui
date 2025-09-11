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
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation for better table view

    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Products Export', 14, 20);

    // Add export date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Prepare table data
    const tableData = products.map((product) => [
      product.name || 'N/A',
      product.category?.name || 'N/A',
      `$${product.price || 0}`,
      product.status || 'N/A',
      product.inStock ? 'Yes' : 'No',
      product.moq || 'N/A',
      product.unit || 'N/A',
      product.tags?.join(', ') || 'N/A',
      product.applications?.join(', ') || 'N/A',
      product.functions?.join(', ') || 'N/A',
      product.countryOfOrigin?.join(', ') || 'N/A',
      product.createdAt
        ? new Date(product.createdAt).toLocaleDateString()
        : 'N/A',
    ]);

    // Define table columns
    const columns = [
      'Product Name',
      'Category',
      'Price',
      'Status',
      'In Stock',
      'MOQ',
      'Unit',
      'Tags',
      'Applications',
      'Functions',
      'Country of Origin',
      'Created Date',
    ];

    // Add table
    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [25, 118, 210], // Blue header
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250], // Light gray for alternate rows
      },
      margin: { left: 14, right: 14 },
    });

    // Add additional product details on separate pages if needed
    if (products.length > 0) {
      let currentY = (doc as any).lastAutoTable.finalY + 20;

      products.forEach((product, index) => {
        // Check if we need a new page
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        // Add detailed product information
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Product ${index + 1}: ${product.name}`, 14, currentY);
        currentY += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const details = [
          `ID: ${product._id}`,
          `Unique ID: ${product.uniqueId || 'N/A'}`,
          `Description: ${product.description || 'N/A'}`,
          `Appearance: ${product.appearance || 'N/A'}`,
          `Dietary Attributes: ${product.dietaryAttributes?.map((attr) => attr.title).join(', ') || 'N/A'}`,
        ];

        details.forEach((detail) => {
          doc.text(detail, 14, currentY);
          currentY += 6;
        });

        currentY += 10;
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
    const { default: XLSX } = await import('xlsx');

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
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

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

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

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
