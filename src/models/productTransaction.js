import mongoose from 'mongoose';

const ProductTransactionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    dateOfSale: { type: Date, required: true },
    sold: { type: Boolean, required: true }
});

const ProductTransaction = mongoose.model('ProductTransaction', ProductTransactionSchema);

export default ProductTransaction;
