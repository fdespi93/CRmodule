<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class codeRef extends MY_Controller {

  public $layout_view = 'layout/indexpage';

  function __construct() {
      parent::__construct();
      
      if ( ! $this->session->userdata('logged_in')){ 
        $this->session->set_flashdata('failed', 'Oops! You need to login.');
        redirect('login');
      }     

  }

  public function homepage()
  {
    $this->data['session'] = $this->session->userdata('logged_in');
    
    echo json_encode($this->data);
  }

  public function getCodeReferenceList($db, $code=''){
    $this->data['crlist'] = $this->coderef_model->get_CodeReferenceList($db,$code);
    echo json_encode($this->data);
  }

  public function saveCodeReference()
  {  
    $db = $this->input->post('db');
    $code = $this->input->post('id');
    $pc = $this->input->post('pc');
    $desc = str_replace("'","''",$this->input->post('desc'));

    $crd = array('Descr' => $desc,
                 'Abbrev' => $this->input->post('abbrev'),
                 'modified_by' => $this->session->userdata['logged_in']['username'],
                 'modified_date' => date("Y-m-d H:i:s"),
                 'IsDeleted' => 0);
    
    if($code){
      $cond = array('ParentCode' => $pc, 'Code' => $code);
      if($this->coderef_model->updateDB($db,'CodeReferenceDetail',$crd, $cond)){         
        echo json_encode(true);  
      }
      else{
        echo json_encode(false);
      }
    }
    else{
      $crd['ParentCode'] = strtoupper($pc);
      $crd['created_by'] = $this->session->userdata['logged_in']['username'];

      if($this->coderef_model->insert_CodeReference($db,$crd,$pc,false)){ 
        echo json_encode(true); 
      }
      else{
        echo json_encode(false);
      }
    }
  }

  public function deleteCodeReference()
  {
    $code = $this->input->post('code');
    $pc = $this->input->post('pc');
    $db = $this->input->post('db');

    if($this->coderef_model->delete_CodeReference($db,$pc,$code))
      echo json_encode(true); 
    else
      echo json_encode(false);
  }

}
  