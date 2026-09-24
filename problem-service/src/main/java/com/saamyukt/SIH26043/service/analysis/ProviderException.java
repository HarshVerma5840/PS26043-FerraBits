package com.saamyukt.SIH26043.service.analysis;

public class ProviderException extends RuntimeException {
    private final boolean isTransient;
    
    public ProviderException(String message, boolean isTransient) {
        super(message);
        this.isTransient = isTransient;
    }
    
    public ProviderException(String message, Throwable cause, boolean isTransient) {
        super(message, cause);
        this.isTransient = isTransient;
    }
    
    public boolean isTransient() {
        return isTransient;
    }
}
