import api from './api';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reason: string;
  sources: string[];
  suggestions: string[];
  category_match: boolean;
  search_results?: any[];
  user_id?: string;
  timestamp?: string;
}

export interface ValidationRequest {
  input: string;
  category: 'dietary' | 'cuisine' | 'equipment' | 'health';
}

export interface ValidationResponse {
  success: boolean;
  validation: ValidationResult;
  error?: string;
}

export class MCPValidatorService {
  private baseUrl = '/anthropic-mcp';

  async validateEntry(input: string, category: 'dietary' | 'cuisine' | 'equipment' | 'health'): Promise<ValidationResult> {
    try {
      const response = await api.post<ValidationResponse>(`${this.baseUrl}/validate-entry`, {
        input: input.trim(),
        category
      });

      if (response.data.success) {
        return response.data.validation;
      } else {
        throw new Error(response.data.error || 'Validation failed');
      }
    } catch (error) {
      console.error('MCP validation error:', error);
      return {
        isValid: false,
        confidence: 0.0,
        reason: error instanceof Error ? error.message : 'Validation failed',
        sources: [],
        suggestions: [],
        category_match: false
      };
    }
  }

  async validateEntries(entries: ValidationRequest[]): Promise<ValidationResult[]> {
    try {
      const response = await api.post<{ success: boolean; validations: ValidationResult[]; error?: string }>(`${this.baseUrl}/validate-entries`, {
        entries
      });

      if (response.data.success) {
        return response.data.validations;
      } else {
        throw new Error(response.data.error || 'Batch validation failed');
      }
    } catch (error) {
      console.error('MCP batch validation error:', error);
      return entries.map(() => ({
        isValid: false,
        confidence: 0.0,
        reason: error instanceof Error ? error.message : 'Validation failed',
        sources: [],
        suggestions: [],
        category_match: false
      }));
    }
  }

  async getValidationSummary(validation: ValidationResult): Promise<string> {
    try {
      const response = await api.post<{ success: boolean; summary: string; error?: string }>(`${this.baseUrl}/validation-summary`, {
        validation
      });

      if (response.data.success) {
        return response.data.summary;
      } else {
        throw new Error(response.data.error || 'Summary generation failed');
      }
    } catch (error) {
      console.error('MCP summary error:', error);
      return this.generateFallbackSummary(validation);
    }
  }

  private generateFallbackSummary(validation: ValidationResult): string {
    if (validation.isValid) {
      return `✅ Valid entry (confidence: ${(validation.confidence * 100).toFixed(1)}%)\nReason: ${validation.reason}`;
    } else {
      return `❌ Invalid entry (confidence: ${(validation.confidence * 100).toFixed(1)}%)\nReason: ${validation.reason}`;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get<{ success: boolean; status: string }>(`${this.baseUrl}/health`);
      return response.data.success && response.data.status === 'healthy';
    } catch (error) {
      console.error('MCP health check failed:', error);
      return false;
    }
  }
}

export const mcpValidator = new MCPValidatorService();
