const Product = require('../models/Product');
const puppeteer = require('puppeteer');
const path = require('path');

const getValidUntilDate = () => {
    const today = new Date();
    const validUntil = new Date(today.setDate(today.getDate() + 30));
    return validUntil.toLocaleDateString();
};

exports.addProducts = async (req, res) => {
    const { products } = req.body;
    const user = req.user.id;

    try {
        const productList = products.map(product => {
            const totalWithoutGST = product.rate * product.qty;
            const gst = totalWithoutGST * 0.18;
            const total = totalWithoutGST + gst;
            
            return {
                ...product,
                totalWithoutGST,
                gst,
                total,
                user,
            };
        });

        await Product.insertMany(productList);

        const grandTotal = productList.reduce((acc, product) => acc + product.total, 0);

        const validUntil = getValidUntilDate();

        let invoiceHTML = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h1 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total-section { margin-top: 20px; float: right; width: 300px; }
                    .total-section table { border-collapse: collapse; width: 100%; }
                    .total-section th, .total-section td { padding: 10px; text-align: right; border: none; }
                    .grand-total { font-weight: bold; font-size: 18px; }
                    .currency { color: #3d85c6; }
                    .highlight { color: #4a90e2; text-decoration: underline; }
                    .valid-until { margin-top: 40px; font-style: italic; }
                    .terms-container { margin-top: 40px; background-color: #1c1c1e; color: white; padding: 20px; border-radius: 10px; }
                    .terms-header { font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Invoice</h1>
                <p>User ID: ${user}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productList.map(product => `
                            <tr>
                                <td>{${product.name}}</td>
                                <td class="highlight">${product.qty}</td>
                                <td>${product.rate.toFixed(2)}</td>
                                <td class="currency">INR ${(product.totalWithoutGST).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-section">
                    <table>
                        <tr>
                            <td>Total</td>
                            <td class="currency">INR ${(grandTotal / 1.18).toFixed(2)}</td> <!-- Total without GST -->
                        </tr>
                        <tr>
                            <td>GST</td>
                            <td>18%</td>
                        </tr>
                        <tr class="grand-total">
                            <td>Grand Total</td>
                            <td class="highlight currency">₹ ${grandTotal.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <p class="valid-until">Valid until: <strong>${validUntil}</strong></p>

                <div class="terms-container">
                    <p class="terms-header">Terms and Conditions</p>
                    <p>We are happy to supply any further information you may need and trust that you call on us to fill your order, which will receive our prompt and careful attention.</p>
                </div>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(invoiceHTML);
        const pdfPath = path.join(__dirname, '..', 'invoices', `invoice_${user}.pdf`);
        await page.pdf({ path: pdfPath });
        await browser.close();

        res.json({ message: 'Products added and PDF generated', pdf: pdfPath });
    } catch (err) {
        console.error('Error generating PDF:', err.message);
        res.status(500).send('Server error');
    }
};

exports.viewQuotations = async (req, res) => {
    const user = req.user.id;

    try {
        const products = await Product.find({ user });
        res.json(products);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
