// Mock email service - in production, integrate with SendGrid, Mailgun, etc.
export const sendOTPEmail = async (email, otp) => {
    console.log(`📧 Sending OTP to ${email}: ${otp}`);
    console.log(`In production, this would send a real email with OTP: ${otp}`);
    
    // Simulate email sending delay
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`✅ OTP email sent to ${email}`);
            resolve(true);
        }, 1000);
    });
};

export const sendOrderConfirmation = async (email, orderDetails) => {
    console.log(`📧 Order confirmation sent to ${email}`);
    console.log(`Order Details:`, orderDetails);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`✅ Order confirmation email sent to ${email}`);
            resolve(true);
        }, 1000);
    });
};

export const sendPasswordResetEmail = async (email, resetToken) => {
    console.log(`📧 Password reset email sent to ${email}`);
    console.log(`Reset Token: ${resetToken}`);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`✅ Password reset email sent to ${email}`);
            resolve(true);
        }, 1000);
    });
};

export const sendOrderStatusUpdate = async (email, orderNumber, status) => {
    console.log(`📧 Order status update sent to ${email}`);
    console.log(`Order #${orderNumber} is now ${status}`);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`✅ Order status email sent to ${email}`);
            resolve(true);
        }, 1000);
    });
};

export const sendWelcomeEmail = async (email, name) => {
    console.log(`📧 Welcome email sent to ${email}`);
    console.log(`Welcome ${name} to SnapBuy!`);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`✅ Welcome email sent to ${email}`);
            resolve(true);
        }, 1000);
    });
};