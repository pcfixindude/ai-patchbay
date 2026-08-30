export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      builds: {
        Row: {
          created_at: string
          description: string | null
          graph: Json
          id: string
          name: string
          owner_id: string
          schema_version: number
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          graph: Json
          id?: string
          name: string
          owner_id: string
          schema_version?: number
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          graph?: Json
          id?: string
          name?: string
          owner_id?: string
          schema_version?: number
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      compatibility_edge_sources: {
        Row: {
          compatibility_edge_id: string
          evidence_notes: string | null
          source_id: string
        }
        Insert: {
          compatibility_edge_id: string
          evidence_notes?: string | null
          source_id: string
        }
        Update: {
          compatibility_edge_id?: string
          evidence_notes?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_edge_sources_compatibility_edge_id_fkey"
            columns: ["compatibility_edge_id"]
            isOneToOne: false
            referencedRelation: "compatibility_edges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_edge_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_edges: {
        Row: {
          compatibility_level: string
          confidence: number
          configuration_notes: string | null
          configuration_required: boolean
          created_at: string
          deprecated_at: string | null
          id: string
          last_verified_at: string | null
          limitations: string | null
          maximum_version: string | null
          minimum_version: string | null
          notes: string
          platform_constraints: Json
          source_port_id: string
          status: string
          target_port_id: string
          updated_at: string
        }
        Insert: {
          compatibility_level: string
          confidence: number
          configuration_notes?: string | null
          configuration_required?: boolean
          created_at?: string
          deprecated_at?: string | null
          id?: string
          last_verified_at?: string | null
          limitations?: string | null
          maximum_version?: string | null
          minimum_version?: string | null
          notes: string
          platform_constraints?: Json
          source_port_id: string
          status: string
          target_port_id: string
          updated_at?: string
        }
        Update: {
          compatibility_level?: string
          confidence?: number
          configuration_notes?: string | null
          configuration_required?: boolean
          created_at?: string
          deprecated_at?: string | null
          id?: string
          last_verified_at?: string | null
          limitations?: string | null
          maximum_version?: string | null
          minimum_version?: string | null
          notes?: string
          platform_constraints?: Json
          source_port_id?: string
          status?: string
          target_port_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_edges_source_port_id_fkey"
            columns: ["source_port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_edges_target_port_id_fkey"
            columns: ["target_port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      component_aliases: {
        Row: {
          alias: string
          component_id: string
          id: string
          normalized_alias: string | null
        }
        Insert: {
          alias: string
          component_id: string
          id?: string
          normalized_alias?: string | null
        }
        Update: {
          alias?: string
          component_id?: string
          id?: string
          normalized_alias?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "component_aliases_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
        ]
      }
      component_external_refs: {
        Row: {
          canonical: boolean
          component_id: string
          created_at: string
          external_id: string
          external_url: string
          id: string
          last_seen_at: string | null
          metadata: Json
          source_system: string
          updated_at: string
        }
        Insert: {
          canonical?: boolean
          component_id: string
          created_at?: string
          external_id: string
          external_url: string
          id?: string
          last_seen_at?: string | null
          metadata?: Json
          source_system: string
          updated_at?: string
        }
        Update: {
          canonical?: boolean
          component_id?: string
          created_at?: string
          external_id?: string
          external_url?: string
          id?: string
          last_seen_at?: string | null
          metadata?: Json
          source_system?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "component_external_refs_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
        ]
      }
      component_sources: {
        Row: {
          claim_type: string
          component_id: string
          notes: string | null
          source_id: string
        }
        Insert: {
          claim_type?: string
          component_id: string
          notes?: string | null
          source_id: string
        }
        Update: {
          claim_type?: string
          component_id?: string
          notes?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "component_sources_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "component_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      component_types: {
        Row: {
          created_at: string
          display_order: number
          key: string
          label: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          key: string
          label: string
        }
        Update: {
          created_at?: string
          display_order?: number
          key?: string
          label?: string
        }
        Relationships: []
      }
      components: {
        Row: {
          cli_available: boolean | null
          cloud_capable: boolean | null
          coding_capable: boolean | null
          component_type: string
          created_at: string
          description: string
          docs_url: string | null
          first_seen_at: string | null
          github_url: string | null
          gui_available: boolean | null
          huggingface_url: string | null
          id: string
          last_verified_at: string | null
          local_capable: boolean | null
          logo_license_notes: string | null
          logo_path: string | null
          logo_source_url: string | null
          logo_url: string | null
          long_description: string | null
          metadata: Json
          multimodal: boolean | null
          name: string
          official_website_url: string | null
          open_source: boolean | null
          open_weights: boolean | null
          operating_systems: Json
          organization_id: string | null
          parent_component_id: string | null
          pricing_url: string | null
          short_name: string
          slug: string
          status: string
          subtype: string | null
          tags: Json
          tool_calling_capable: boolean | null
          updated_at: string
          visibility: string
          vision_capable: boolean | null
        }
        Insert: {
          cli_available?: boolean | null
          cloud_capable?: boolean | null
          coding_capable?: boolean | null
          component_type: string
          created_at?: string
          description: string
          docs_url?: string | null
          first_seen_at?: string | null
          github_url?: string | null
          gui_available?: boolean | null
          huggingface_url?: string | null
          id?: string
          last_verified_at?: string | null
          local_capable?: boolean | null
          logo_license_notes?: string | null
          logo_path?: string | null
          logo_source_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          metadata?: Json
          multimodal?: boolean | null
          name: string
          official_website_url?: string | null
          open_source?: boolean | null
          open_weights?: boolean | null
          operating_systems?: Json
          organization_id?: string | null
          parent_component_id?: string | null
          pricing_url?: string | null
          short_name: string
          slug: string
          status?: string
          subtype?: string | null
          tags?: Json
          tool_calling_capable?: boolean | null
          updated_at?: string
          visibility?: string
          vision_capable?: boolean | null
        }
        Update: {
          cli_available?: boolean | null
          cloud_capable?: boolean | null
          coding_capable?: boolean | null
          component_type?: string
          created_at?: string
          description?: string
          docs_url?: string | null
          first_seen_at?: string | null
          github_url?: string | null
          gui_available?: boolean | null
          huggingface_url?: string | null
          id?: string
          last_verified_at?: string | null
          local_capable?: boolean | null
          logo_license_notes?: string | null
          logo_path?: string | null
          logo_source_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          metadata?: Json
          multimodal?: boolean | null
          name?: string
          official_website_url?: string | null
          open_source?: boolean | null
          open_weights?: boolean | null
          operating_systems?: Json
          organization_id?: string | null
          parent_component_id?: string | null
          pricing_url?: string | null
          short_name?: string
          slug?: string
          status?: string
          subtype?: string | null
          tags?: Json
          tool_calling_capable?: boolean | null
          updated_at?: string
          visibility?: string
          vision_capable?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "components_component_type_fkey"
            columns: ["component_type"]
            isOneToOne: false
            referencedRelation: "component_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "components_parent_component_id_fkey"
            columns: ["parent_component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
        ]
      }
      model_metadata: {
        Row: {
          accelerator_notes: string | null
          active_parameter_count: number | null
          apple_silicon_notes: string | null
          approximate_file_size_bytes: number | null
          architecture: string | null
          assumptions: string | null
          audio_support: boolean | null
          coding_specialization: boolean | null
          component_id: string
          context_window: number | null
          deprecated_date: string | null
          inherits_from_component_id: string | null
          license: string | null
          maximum_output_tokens: number | null
          minimum_ram_bytes: number | null
          modalities: Json
          parameter_count: number | null
          quantization: string | null
          reasoning: boolean | null
          recommended_ram_bytes: number | null
          release_date: string | null
          tool_calling: boolean | null
          updated_at: string
          vision_support: boolean | null
          weight_format: string | null
        }
        Insert: {
          accelerator_notes?: string | null
          active_parameter_count?: number | null
          apple_silicon_notes?: string | null
          approximate_file_size_bytes?: number | null
          architecture?: string | null
          assumptions?: string | null
          audio_support?: boolean | null
          coding_specialization?: boolean | null
          component_id: string
          context_window?: number | null
          deprecated_date?: string | null
          inherits_from_component_id?: string | null
          license?: string | null
          maximum_output_tokens?: number | null
          minimum_ram_bytes?: number | null
          modalities?: Json
          parameter_count?: number | null
          quantization?: string | null
          reasoning?: boolean | null
          recommended_ram_bytes?: number | null
          release_date?: string | null
          tool_calling?: boolean | null
          updated_at?: string
          vision_support?: boolean | null
          weight_format?: string | null
        }
        Update: {
          accelerator_notes?: string | null
          active_parameter_count?: number | null
          apple_silicon_notes?: string | null
          approximate_file_size_bytes?: number | null
          architecture?: string | null
          assumptions?: string | null
          audio_support?: boolean | null
          coding_specialization?: boolean | null
          component_id?: string
          context_window?: number | null
          deprecated_date?: string | null
          inherits_from_component_id?: string | null
          license?: string | null
          maximum_output_tokens?: number | null
          minimum_ram_bytes?: number | null
          modalities?: Json
          parameter_count?: number | null
          quantization?: string | null
          reasoning?: boolean | null
          recommended_ram_bytes?: number | null
          release_date?: string | null
          tool_calling?: boolean | null
          updated_at?: string
          vision_support?: boolean | null
          weight_format?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_metadata_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: true
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_metadata_inherits_from_component_id_fkey"
            columns: ["inherits_from_component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
        ]
      }
      model_metadata_sources: {
        Row: {
          assumptions: string | null
          component_id: string
          field_name: string
          source_id: string
        }
        Insert: {
          assumptions?: string | null
          component_id: string
          field_name: string
          source_id: string
        }
        Update: {
          assumptions?: string | null
          component_id?: string
          field_name?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_metadata_sources_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "model_metadata"
            referencedColumns: ["component_id"]
          },
          {
            foreignKeyName: "model_metadata_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      ports: {
        Row: {
          cardinality: string
          component_id: string
          created_at: string
          data_type: string
          description: string
          direction: string
          id: string
          metadata: Json
          name: string
          protocol_type: string
          required: boolean
          slug: string
          transport_type: string
          updated_at: string
        }
        Insert: {
          cardinality?: string
          component_id: string
          created_at?: string
          data_type: string
          description: string
          direction: string
          id?: string
          metadata?: Json
          name: string
          protocol_type: string
          required?: boolean
          slug: string
          transport_type: string
          updated_at?: string
        }
        Update: {
          cardinality?: string
          component_id?: string
          created_at?: string
          data_type?: string
          description?: string
          direction?: string
          id?: string
          metadata?: Json
          name?: string
          protocol_type?: string
          required?: boolean
          slug?: string
          transport_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ports_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      proposed_changes: {
        Row: {
          applied_at: string | null
          before_value: Json | null
          change_status: string
          confidence: number
          created_at: string
          entity_id: string | null
          entity_table: string
          failure_reason: string | null
          field_name: string | null
          fingerprint: string | null
          id: string
          objective_change: boolean
          observation_id: string | null
          operation: string
          proposed_value: Json
          rationale: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          risk_classification: string
          source_authority: string
          source_url: string | null
          superseded_by: string | null
          target_component_id: string | null
          update_run_id: string
        }
        Insert: {
          applied_at?: string | null
          before_value?: Json | null
          change_status?: string
          confidence?: number
          created_at?: string
          entity_id?: string | null
          entity_table: string
          failure_reason?: string | null
          field_name?: string | null
          fingerprint?: string | null
          id?: string
          objective_change?: boolean
          observation_id?: string | null
          operation?: string
          proposed_value: Json
          rationale?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          risk_classification?: string
          source_authority?: string
          source_url?: string | null
          superseded_by?: string | null
          target_component_id?: string | null
          update_run_id: string
        }
        Update: {
          applied_at?: string | null
          before_value?: Json | null
          change_status?: string
          confidence?: number
          created_at?: string
          entity_id?: string | null
          entity_table?: string
          failure_reason?: string | null
          field_name?: string | null
          fingerprint?: string | null
          id?: string
          objective_change?: boolean
          observation_id?: string | null
          operation?: string
          proposed_value?: Json
          rationale?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          risk_classification?: string
          source_authority?: string
          source_url?: string | null
          superseded_by?: string | null
          target_component_id?: string | null
          update_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposed_changes_observation_id_fkey"
            columns: ["observation_id"]
            isOneToOne: false
            referencedRelation: "update_observations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposed_changes_target_component_id_fkey"
            columns: ["target_component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposed_changes_update_run_id_fkey"
            columns: ["update_run_id"]
            isOneToOne: false
            referencedRelation: "update_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          publication_date: string | null
          publisher: string
          retrieved_at: string
          source_type: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          publication_date?: string | null
          publisher: string
          retrieved_at: string
          source_type: string
          title: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          publication_date?: string | null
          publisher?: string
          retrieved_at?: string
          source_type?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      update_audit_events: {
        Row: {
          action: string
          actor_id: string | null
          after_value: Json | null
          before_value: Json | null
          created_at: string
          detail: Json
          id: string
          proposal_id: string | null
          update_run_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          detail?: Json
          id?: string
          proposal_id?: string | null
          update_run_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          detail?: Json
          id?: string
          proposal_id?: string | null
          update_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "update_audit_events_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposed_changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_audit_events_update_run_id_fkey"
            columns: ["update_run_id"]
            isOneToOne: false
            referencedRelation: "update_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      update_observations: {
        Row: {
          authority: string
          component_external_ref_id: string | null
          confidence: number
          created_at: string
          external_entity_id: string
          field_name: string | null
          fingerprint: string
          id: string
          observation_type: string
          observed_value: Json
          payload_hash: string
          payload_snapshot: Json
          retrieved_at: string
          source_system: string
          source_timestamp: string | null
          source_url: string
          update_run_id: string
        }
        Insert: {
          authority: string
          component_external_ref_id?: string | null
          confidence: number
          created_at?: string
          external_entity_id: string
          field_name?: string | null
          fingerprint: string
          id?: string
          observation_type: string
          observed_value: Json
          payload_hash: string
          payload_snapshot?: Json
          retrieved_at?: string
          source_system: string
          source_timestamp?: string | null
          source_url: string
          update_run_id: string
        }
        Update: {
          authority?: string
          component_external_ref_id?: string | null
          confidence?: number
          created_at?: string
          external_entity_id?: string
          field_name?: string | null
          fingerprint?: string
          id?: string
          observation_type?: string
          observed_value?: Json
          payload_hash?: string
          payload_snapshot?: Json
          retrieved_at?: string
          source_system?: string
          source_timestamp?: string | null
          source_url?: string
          update_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_observations_component_external_ref_id_fkey"
            columns: ["component_external_ref_id"]
            isOneToOne: false
            referencedRelation: "component_external_refs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_observations_update_run_id_fkey"
            columns: ["update_run_id"]
            isOneToOne: false
            referencedRelation: "update_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      update_runs: {
        Row: {
          adapter_id: string
          completed_at: string | null
          created_at: string
          error_count: number
          error_message: string | null
          error_summary: string | null
          finished_at: string | null
          id: string
          metadata: Json
          observations_created: number
          proposals_auto_applied: number
          proposals_created: number
          proposals_requiring_review: number
          records_examined: number
          started_at: string | null
          status: string
          summary: Json
          update_source_id: string
        }
        Insert: {
          adapter_id: string
          completed_at?: string | null
          created_at?: string
          error_count?: number
          error_message?: string | null
          error_summary?: string | null
          finished_at?: string | null
          id?: string
          metadata?: Json
          observations_created?: number
          proposals_auto_applied?: number
          proposals_created?: number
          proposals_requiring_review?: number
          records_examined?: number
          started_at?: string | null
          status: string
          summary?: Json
          update_source_id: string
        }
        Update: {
          adapter_id?: string
          completed_at?: string | null
          created_at?: string
          error_count?: number
          error_message?: string | null
          error_summary?: string | null
          finished_at?: string | null
          id?: string
          metadata?: Json
          observations_created?: number
          proposals_auto_applied?: number
          proposals_created?: number
          proposals_requiring_review?: number
          records_examined?: number
          started_at?: string | null
          status?: string
          summary?: Json
          update_source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_runs_update_source_id_fkey"
            columns: ["update_source_id"]
            isOneToOne: false
            referencedRelation: "update_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      update_sources: {
        Row: {
          adapter_type: string
          base_url: string | null
          configuration: Json
          created_at: string
          enabled: boolean
          id: string
          name: string
        }
        Insert: {
          adapter_type: string
          base_url?: string | null
          configuration?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
        }
        Update: {
          adapter_type?: string
          base_url?: string | null
          configuration?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      attach_compatibility_source: {
        Args: { p_edge_id: string; p_source_id: string }
        Returns: undefined
      }
      attach_component_evidence: {
        Args: {
          p_component_id: string
          p_notes?: string
          p_publication_date?: string
          p_publisher: string
          p_source_type: string
          p_title: string
          p_url: string
        }
        Returns: string
      }
      bulk_review_update_proposals: {
        Args: {
          p_decision: string
          p_proposal_ids: string[]
          p_review_notes?: string
        }
        Returns: number
      }
      detach_compatibility_source: {
        Args: { p_edge_id: string; p_source_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_editor: { Args: never; Returns: boolean }
      review_update_proposal: {
        Args: {
          p_decision: string
          p_proposal_id: string
          p_review_notes?: string
        }
        Returns: {
          applied_at: string | null
          before_value: Json | null
          change_status: string
          confidence: number
          created_at: string
          entity_id: string | null
          entity_table: string
          failure_reason: string | null
          field_name: string | null
          fingerprint: string | null
          id: string
          objective_change: boolean
          observation_id: string | null
          operation: string
          proposed_value: Json
          rationale: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          risk_classification: string
          source_authority: string
          source_url: string | null
          superseded_by: string | null
          target_component_id: string | null
          update_run_id: string
        }
        SetofOptions: {
          from: "*"
          to: "proposed_changes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_compatibility_with_evidence: {
        Args: {
          p_confidence: number
          p_configuration_notes: string
          p_evidence_url?: string
          p_level: string
          p_limitations: string
          p_notes: string
          p_source_port_id: string
          p_status: string
          p_target_port_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

