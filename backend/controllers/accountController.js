import Account from "../models/accountModel.js";

/**
 * Create Account
 */
export const createAccount = async (req, res) => {
    try {
        const account = await Account.create(req.body);
        res.status(201).json(account);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Get All Accounts (not deleted)
 */
export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ del_flag: false })
            .populate("account_user", "name email")
            .sort({ createdAt: -1 });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get Single Account
 */
export const getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);
        if (!account) return res.status(404).json({ message: "Account not found" });
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update Account
 */
export const updateAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(account);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Soft Delete Account
 */
export const deleteAccount = async (req, res) => {
    try {
        await Account.findByIdAndUpdate(req.params.id, { del_flag: true });
        res.json({ message: "Account deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
