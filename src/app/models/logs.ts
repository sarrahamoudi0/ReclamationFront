import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Logs {
  id: string;
  agentEmail: string;
  action: string;
  details: string;
  timestamp: string;  
}
