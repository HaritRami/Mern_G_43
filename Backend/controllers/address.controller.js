import AddressModel from "../models/address.model.js";
import User from "../models/user.model.js";

const validateAddressData = (data, isCreate = false) => {
  const errors = {};
  
  if (isCreate || data.address_line !== undefined) {
    if (!data.address_line || !data.address_line.trim()) {
      errors.address_line = 'Address line is required';
    } else if (data.address_line.trim().length < 5) {
      errors.address_line = 'Address line must be at least 5 characters long';
    } else if (data.address_line.trim().length > 100) {
      errors.address_line = 'Address line must not exceed 100 characters';
    }
  }

  if (isCreate || data.city !== undefined) {
    if (!data.city || !data.city.trim()) {
      errors.city = 'City is required';
    } else if (data.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters long';
    } else if (data.city.trim().length > 50) {
      errors.city = 'City must not exceed 50 characters';
    } else if (!/^[a-zA-Z\s-]+$/.test(data.city.trim())) {
      errors.city = 'City can only contain letters, spaces, and hyphens';
    }
  }

  if (isCreate || data.state !== undefined) {
    if (!data.state || !data.state.trim()) {
      errors.state = 'State is required';
    } else if (data.state.trim().length < 2) {
      errors.state = 'State must be at least 2 characters long';
    } else if (data.state.trim().length > 50) {
      errors.state = 'State must not exceed 50 characters';
    } else if (!/^[a-zA-Z\s-]+$/.test(data.state.trim())) {
      errors.state = 'State can only contain letters, spaces, and hyphens';
    }
  }

  if (isCreate || data.country !== undefined) {
    if (!data.country || !data.country.trim()) {
      errors.country = 'Country is required';
    } else if (data.country.trim().length < 2) {
      errors.country = 'Country must be at least 2 characters long';
    } else if (data.country.trim().length > 50) {
      errors.country = 'Country must not exceed 50 characters';
    } else if (!/^[a-zA-Z\s-]+$/.test(data.country.trim())) {
      errors.country = 'Country can only contain letters, spaces, and hyphens';
    }
  }

  if (isCreate || data.mobile !== undefined) {
    if (!data.mobile || !data.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(data.mobile.trim())) {
      errors.mobile = 'Mobile number must be 10-15 digits with an optional leading +';
    }
  }

  return errors;
};

// Get all addresses for the authenticated user
export async function getUserAddressesController(request, response) {
  try {
    // SECURITY: Ignore request.params.userId to prevent snooping. Force token identity.
    const userId = request.user._id;
    console.log('userId strictly bound to token:', userId);

    // Get all non-deleted addresses for the user
    // Sort by default first, then newest
    const addresses = await AddressModel.find({ 
      user: userId,
      is_delete: false 
    }).sort({ isDefault: -1, createdAt: -1 });

    return response.status(200).json({
      message: "Addresses retrieved successfully.",
      error: false,
      success: true,
      data: addresses
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

export async function createAddressController(request, response) {
  try {
    const { address_line, city, state, country, mobile, isDefault } = request.body;
    console.log('Root endpoint accessed',request);
    
    // SECURITY: Use the authenticated user's ID
    const user = request.user._id;

    // VALIDATION
    const validationErrors = validateAddressData(request.body, true);
    if (Object.keys(validationErrors).length > 0) {
      return response.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
        error: true,
        success: false
      });
    }

    // Check if user has any addresses
    const existingAddressesCount = await AddressModel.countDocuments({ user, is_delete: false });
    
    // If it's the first address, or specifically requested as default
    const shouldBeDefault = existingAddressesCount === 0 || isDefault;

    if (shouldBeDefault && existingAddressesCount > 0) {
      // Unset other defaults
      await AddressModel.updateMany({ user, is_delete: false }, { isDefault: false });
    }

    const newAddress = new AddressModel({ 
      user, 
      address_line, 
      city, 
      state, 
      country, 
      mobile,
      isDefault: shouldBeDefault,
      is_delete: false
    });
    const savedAddress = await newAddress.save();

    return response.status(201).json({
      message: "Address created successfully.",
      error: false,
      success: true,
      data: savedAddress
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

export async function getAddressController(request, response) {
  try {
    const { addressId } = request.params;
    console.log('addressId',addressId);
    
    const address = await AddressModel.findOne({ 
      _id: addressId,
      is_delete: false 
    });

    if (!address) {
      return response.status(404).json({
        message: "Address not found.",
        error: true,
        success: false
      });
    }

    // Verify the address belongs to the authenticated user
    if (address.user.toString() !== request.user._id.toString()) {
      return response.status(403).json({
        message: "You can only view your own addresses",
        error: true,
        success: false
      });
    }

    return response.status(200).json({
      message: "Address retrieved successfully.",
      error: false,
      success: true,
      data: address
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

export async function updateAddressController(request, response) {
  try {
    const { addressId } = request.params;
    const updateData = request.body;

    // First find the address to verify ownership
    const existingAddress = await AddressModel.findById(addressId);
    if (!existingAddress || existingAddress.is_delete) {
      return response.status(404).json({
        message: "Address not found.",
        error: true,
        success: false
      });
    }

    // Verify the address belongs to the authenticated user
    if (existingAddress.user.toString() !== request.user._id.toString()) {
      return response.status(403).json({
        message: "You can only update your own addresses",
        error: true,
        success: false
      });
    }

    // VALIDATION
    const validationErrors = validateAddressData(updateData, false);
    if (Object.keys(validationErrors).length > 0) {
      return response.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
        error: true,
        success: false
      });
    }

    // Prevent updating the user field
    delete updateData.user;

    // Handle isDefault logic
    if (updateData.isDefault === true) {
      await AddressModel.updateMany({ user: existingAddress.user, is_delete: false }, { isDefault: false });
    } else if (updateData.isDefault === false && existingAddress.isDefault) {
      // Prevent unsetting the only default address without setting another one
      delete updateData.isDefault;
    }

    const address = await AddressModel.findByIdAndUpdate(
      addressId, 
      { ...updateData, is_delete: false },
      { new: true }
    );

    return response.status(200).json({
      message: "Address updated successfully.",
      error: false,
      success: true,
      data: address
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

export async function deleteAddressController(request, response) {
  try {
    const { addressId } = request.params;
    
    // First find the address to verify ownership
    const existingAddress = await AddressModel.findById(addressId);
    if (!existingAddress || existingAddress.is_delete) {
      return response.status(404).json({
        message: "Address not found.",
        error: true,
        success: false
      });
    }

    // Verify the address belongs to the authenticated user
    if (existingAddress.user.toString() !== request.user._id.toString()) {
      return response.status(403).json({
        message: "You can only delete your own addresses",
        error: true,
        success: false
      });
    }

    const totalAddresses = await AddressModel.countDocuments({ user: existingAddress.user, is_delete: false });
    if (totalAddresses <= 1) {
      return response.status(400).json({
        message: "Cannot delete your only address. Please add another address first.",
        error: true,
        success: false
      });
    }

    // Soft delete by setting is_delete to true
    const address = await AddressModel.findByIdAndUpdate(
      addressId,
      { is_delete: true, isDefault: false },
      { new: true }
    );

    // If we deleted the default address, make the most recently created one the new default
    if (existingAddress.isDefault) {
      const nextAddress = await AddressModel.findOne({ user: existingAddress.user, is_delete: false }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return response.status(200).json({
      message: "Address deleted successfully.",
      error: false,
      success: true
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}