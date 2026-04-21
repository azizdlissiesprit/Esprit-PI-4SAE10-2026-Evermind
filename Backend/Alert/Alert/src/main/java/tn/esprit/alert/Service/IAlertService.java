package tn.esprit.alert.Service;

import tn.esprit.alert.Entity.Alert;
import tn.esprit.alert.Entity.StatutAlerte;

import java.util.List;

public interface IAlertService {
    public Alert resolveAlert(Long alertId);
    public Alert addAlert(Alert a);
    public List<Alert> retrieveAllAlerts();
    public Alert retrieveAlert(Long alertId);
    public Alert updateStatus(Long alertId, StatutAlerte newStatus);
    public Alert ignoreAlert(Long alertId);
    public void removeAlert(Long alertId);
    Alert updateAlert(Long id, Alert alert);
    public List<Alert> retrieveAlertsByIds(List<Long> ids);
}
